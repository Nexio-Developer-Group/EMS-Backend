const Bill = require('../models/Bill');

// Convert UTC date to IST
const toIST = (date) => {
  const utc = new Date(date);
  const istOffset = 5.5 * 60; // IST = UTC + 5:30
  return new Date(utc.getTime() + istOffset * 60000);
};

// Shop segments
const shopSegments = [
  { label: '09:00 AM - 11:59 AM', start: 9, end: 11 },
  { label: '12:00 PM - 02:59 PM', start: 12, end: 14 },
  { label: '03:00 PM - 05:59 PM', start: 15, end: 17 },
  { label: '06:00 PM - 10:59 PM', start: 18, end: 22 }, // corrected
];

const getDashboardStats = async (req, res) => {
  try {
    const { period = 'daily', startDate, endDate } = req.query;

    let start = startDate ? new Date(startDate) : new Date();
    let end = endDate ? new Date(endDate) : new Date();

    if (!startDate) start.setHours(0, 0, 0, 0);
    if (!endDate) end.setHours(23, 59, 59, 999);

    const bills = await Bill.find({
      createdAt: { $gte: start, $lte: end },
    }).lean();

    const totalBills = bills.length;
    const totalAmount = bills.reduce((acc, bill) => acc + bill.grandTotal, 0);
    const avgDiscount =
      bills.length > 0
        ? bills.reduce((acc, bill) => acc + (bill.discount / bill.subTotal) * 100, 0) / bills.length
        : 0;

    // Count bills per segment
    const segmentCount = {};
    shopSegments.forEach((seg) => (segmentCount[seg.label] = 0));

    bills.forEach((bill) => {
      const istDate = toIST(bill.createdAt);
      const hour = istDate.getHours();

      for (const seg of shopSegments) {
        if (hour >= seg.start && hour <= seg.end) {
          segmentCount[seg.label]++;
          break;
        }
      }
    });

    const mostActiveSegment = Object.keys(segmentCount).reduce((a, b) =>
      segmentCount[a] > segmentCount[b] ? a : b
    );

    // Recurring/new customers
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
    res.status(500).json({ status: 0, message: 'Server error', error: error.message });
  }
};

module.exports = { getDashboardStats };
