// models/Item.js

const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Item description is required'],
      trim: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category', // Link to Category model
      required: [true, 'Item must belong to a category'],
    },
    price: {
      type: Number,
      required: [true, 'Item price is required'],
      min: [0, 'Price cannot be negative'],
    },
    images: [
      {
        type: String, // store URLs of images
      },
    ],
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      reviewsCount: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    sku: {
      type: String,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true, // createdAt and updatedAt
  }
);

// Optional: Index for fast search by name or category
itemSchema.index({ name: 1, category: 1 });

module.exports = mongoose.model('Item', itemSchema);
