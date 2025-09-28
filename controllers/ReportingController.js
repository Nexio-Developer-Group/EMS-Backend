const Bill = require('../models/Bill');

// Helper to get start and end dates based on period
const getDateRange = (period) => {
  const now = new Date();
  let start, end;

  switch (period) {
    case 'daily':
      start = new Date(now.setHours(0, 0, 0, 0));
      end = new Date(now.setHours(23, 59, 59, 999));
      break;
    case 'weekly':
      const firstDayOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      start = new Date(firstDayOfWeek.setHours(0, 0, 0, 0));
      end = new Date(now.setHours(23, 59, 59, 999));
      break;
    case 'monthly':
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    default:
      start = new Date();
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setHours(23, 59, 59, 999);
      break;
  }

  return { start, end };
};

const getDashboardStats = async (req, res) => {
  try {
    const { period = 'daily', startDate, endDate } = req.query;
    let start, end;

    if (startDate && endDate) {
      start = new Date(startDate);
      end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
    } else {
      const range = getDateRange(period);
      start = range.start;
      end = range.end;
    }

    const bills = await Bill.find({
      createdAt: { $gte: start, $lte: end },
    }).lean();

    // Calculate stats
    const totalBills = bills.length;
    const totalAmount = bills.reduce((acc, bill) => acc + bill.grandTotal, 0);
    const avgDiscount =
      bills.length > 0
        ? bills.reduce((acc, bill) => acc + (bill.discount / bill.subTotal) * 100, 0) / bills.length
        : 0;

    // Shop operating hour segments (9 AM to 12 PM, 12 PM to 3 PM, 3 PM to 6 PM)
    const segments = {
      '09:00-11:59': 0,
      '12:00-14:59': 0,
      '15:00-17:59': 0,
      '18:00-20:59': 0, // optional for late orders
    };

    bills.forEach((bill) => {
      const hour = new Date(bill.createdAt).getHours();
      if (hour >= 9 && hour < 12) segments['09:00-11:59']++;
      else if (hour >= 12 && hour < 15) segments['12:00-14:59']++;
      else if (hour >= 15 && hour < 18) segments['15:00-17:59']++;
      else if (hour >= 18 && hour < 21) segments['18:00-20:59']++;
    });

    const mostActiveSegment = Object.keys(segments).reduce((a, b) =>
      segments[a] > segments[b] ? a : b
    );

    // Recurring vs new customers
    const recurringCustomers = new Set();
    const newCustomers = new Set();

    for (const bill of bills) {
      const pastBill = await Bill.findOne({
        phone: bill.phone,
        createdAt: { $lt: start },
      });
      if (pastBill) recurringCustomers.add(bill.phone);
      else newCustomers.add(bill.phone);
    }

    res.json({
      status: 1,
      data: {
        totalBills,
        totalAmount,
        avgDiscount: avgDiscount.toFixed(2),
        mostActiveSegment,
        recurringCustomers: recurringCustomers.size,
        newCustomers: newCustomers.size,
      },
      message: 'Dashboard stats fetched',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: 0,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports = { getDashboardStats };
