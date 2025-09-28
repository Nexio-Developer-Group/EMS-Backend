// controllers/billController.js
const mongoose = require('mongoose');
const Bill = require('../models/Bill');
const User = require('../models/User');
const Item = require('../models/Item');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// ─── CREATE BILL ─────────────────────────────
exports.createBill = async (req, res) => {
  try {
    const { phone, items, discount = 0, paymentMethod = 'cash', createdBy } = req.body;

    if (!phone || !items || items.length === 0) {
      return res.status(400).json({ message: 'Phone and items are required' });
    }

    // Find or create user
    let user = await User.findOne({ phone });
    if (!user) {
      user = new User({ user_id: `USR-${Date.now()}`, phone });
      await user.save();
    }

    // Prepare items snapshot
    let subTotal = 0;
    const billItems = [];

    for (const i of items) {
      const dbItem = await Item.findById(i.item);
      if (!dbItem) return res.status(404).json({ message: `Item not found: ${i.item}` });

      const quantity = i.quantity || 1;
      const total = dbItem.price * quantity;
      subTotal += total;

      billItems.push({
        item: dbItem._id,
        name: dbItem.name,
        price: dbItem.price,
        quantity,
        total,
      });
    }

    const grandTotal = subTotal - discount;

    // Generate unique billId
    const lastBill = await Bill.findOne().sort({ createdAt: -1 });
    let nextNumber = 1;
    if (lastBill && lastBill.billId) {
      const lastNum = parseInt(lastBill.billId.replace('VANS', ''), 10);
      nextNumber = lastNum + 1;
    }
    const billId = `VANS${String(nextNumber).padStart(4, '0')}`;

    const bill = new Bill({
      billId,           // explicitly set billId
      user: user._id,
      phone: user.phone,
      items: billItems,
      subTotal,
      discount,
      grandTotal,
      paymentMethod,
      createdBy,
    });

    await bill.save();
    res.status(201).json({ status: 1, data: bill, message: 'Bill created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: 'Server error', error: error.message });
  }
};


// ─── EDIT BILL ─────────────────────────────
exports.editBill = async (req, res) => {
  try {
    const { id } = req.params;
    const { items, discount, paymentMethod } = req.body;

    if (!isValidObjectId(id)) return res.status(400).json({ message: 'Invalid bill ID' });

    const bill = await Bill.findById(id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    if (items && items.length > 0) {
      let subTotal = 0;
      const billItems = [];

      for (const i of items) {
        const dbItem = await Item.findById(i.item);
        if (!dbItem) return res.status(404).json({ message: `Item not found: ${i.item}` });

        const quantity = i.quantity || 1;
        const total = dbItem.price * quantity;
        subTotal += total;

        billItems.push({
          item: dbItem._id,
          name: dbItem.name,
          price: dbItem.price,
          quantity,
          total,
        });
      }
      bill.items = billItems;
      bill.subTotal = subTotal;
      bill.grandTotal = subTotal - (discount || bill.discount);
    }

    if (discount !== undefined) {
      bill.discount = discount;
      bill.grandTotal = (bill.subTotal || 0) - discount;
    }

    if (paymentMethod) bill.paymentMethod = paymentMethod;

    await bill.save();
    res.json({ status: 1, data: bill, message: 'Bill updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: 'Server error', error: error.message });
  }
};

// ─── UPDATE BILL STATUS ─────────────────────
exports.updateBillStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'paid', 'cancelled'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    const bill = await Bill.findByIdAndUpdate(id, { status }, { new: true });
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    res.json({ status: 1, data: bill, message: 'Bill status updated' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: 'Server error', error: error.message });
  }
};

// ─── DELETE BILL ────────────────────────────
exports.deleteBill = async (req, res) => {
  try {
    const { id } = req.params;
    const bill = await Bill.findByIdAndDelete(id);
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    res.json({ status: 1, message: 'Bill deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: 'Server error', error: error.message });
  }
};

// ─── SEARCH USERS BY PHONE ─────────────────
exports.searchUserByPhone = async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ message: 'Phone query is required' });

    const users = await User.find({ phone: { $regex: phone, $options: 'i' } });
    res.json({ status: 1, data: users, message: 'Users fetched' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: 'Server error', error: error.message });
  }
};

// ─── GET BILLS BY USER PHONE ───────────────
exports.getBillsByUserPhone = async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) return res.status(400).json({ message: 'Phone query is required' });

    const user = await User.findOne({ phone });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const bills = await Bill.find({ user: user._id }).populate('items.item', 'name price');
    res.json({ status: 1, data: bills, message: 'Bills fetched' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: 'Server error', error: error.message });
  }
};

// ─── GET BILL BY BILL ID ───────────────────
exports.getBillByBillId = async (req, res) => {
  try {
    const { billId } = req.params;
    const bill = await Bill.findOne({ billId }).populate('items.item', 'name price');
    if (!bill) return res.status(404).json({ message: 'Bill not found' });

    res.json({ status: 1, data: bill, message: 'Bill fetched' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: 'Server error', error: error.message });
  }
};

// ─── GET ALL BILLS WITH FILTERS (OPTIONAL) ─
exports.getAllBills = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const bills = await Bill.find(filter)
      .populate('user', 'name phone')
      .populate('items.item', 'name price')
      .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    const total = await Bill.countDocuments(filter);

    res.json({ status: 1, data: bills, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: 0, message: 'Server error', error: error.message });
  }
};
