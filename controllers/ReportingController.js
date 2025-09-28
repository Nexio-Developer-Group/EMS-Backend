// controllers/ReportingController.js
const Bill = require('../models/Bill');
const mongoose = require('mongoose');

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
    // Read query params
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

    // Fetch bills in range
    const bills = await Bill.find({
      createdAt: { $gte: start, $lte: end },
    }).lean();

    // Total bills
    const totalBills = bills.length;

    // Total grandTotal sum
    const totalAmount = bills.reduce((acc, bill) => acc + bill.grandTotal, 0);

    // Average discount %
    const avgDiscount =
      bills.length > 0
        ? bills.reduce((acc, bill) => acc + (bill.discount / bill.subTotal) * 100, 0) / bills.length
        : 0;

    // Most active 4-hour segment
    const segments = {
      '00:00-03:59': 0,
      '04:00-07:59': 0,
      '08:00-11:59': 0,
      '12:00-15:59': 0,
      '16:00-19:59': 0,
      '20:00-23:59': 0,
    };

    bills.forEach((bill) => {
      const hour = new Date(bill.createdAt).getHours();
      if (hour >= 0 && hour < 4) segments['00:00-03:59']++;
      else if (hour >= 4 && hour < 8) segments['04:00-07:59']++;
      else if (hour >= 8 && hour < 12) segments['08:00-11:59']++;
      else if (hour >= 12 && hour < 16) segments['12:00-15:59']++;
      else if (hour >= 16 && hour < 20) segments['16:00-19:59']++;
      else segments['20:00-23:59']++;
    });

    const mostActiveSegment = Object.keys(segments).reduce((a, b) =>
      segments[a] > segments[b] ? a : b
    );

    // Recurring vs new customers
    const recurringCustomers = new Set();
    const newCustomers = new Set();

    for (const bill of bills) {
      const pastBills = await Bill.findOne({
        phone: bill.phone,
        createdAt: { $lt: start },
      });
      if (pastBills) recurringCustomers.add(bill.phone);
      else newCustomers.add(bill.phone);
    }

    return res.json({
      totalBills,
      totalAmount,
      avgDiscount: avgDiscount.toFixed(2),
      mostActiveSegment,
      recurringCustomers: recurringCustomers.size,
      newCustomers: newCustomers.size,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server Error', error });
  }
};

module.exports = {
  getDashboardStats,
};
