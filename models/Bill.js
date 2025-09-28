// models/Bill.js
const mongoose = require('mongoose');

const billItemSchema = new mongoose.Schema({
  item: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true,
  },
  name: {
    type: String,
    required: true, // snapshot of item name
  },
  price: {
    type: Number,
    required: true, // snapshot of price at billing time
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  total: {
    type: Number,
    required: true,
    min: 0,
  },
});

const billSchema = new mongoose.Schema(
  {
    billId: {
      type: String,
      unique: true,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    items: [billItemSchema],
    subTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    grandTotal: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'card', 'upi', 'other'],
      default: 'cash',
    },
    status: {
      type: String,
      enum: ['pending', 'paid', 'cancelled'],
      default: 'paid',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // admin who generated the bill
    },
  },
  { timestamps: true }
);

// Auto-generate incremental billId: VANS0001, VANS0002...
billSchema.pre('save', async function (next) {
  if (this.isNew) {
    const lastBill = await mongoose.model('Bill').findOne().sort({ createdAt: -1 });
    let nextNumber = 1;

    if (lastBill && lastBill.billId) {
      const lastNum = parseInt(lastBill.billId.replace('VANS', ''), 10);
      nextNumber = lastNum + 1;
    }

    this.billId = `VANS${String(nextNumber).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Bill', billSchema);
