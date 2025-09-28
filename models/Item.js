// models/Item.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      minlength: [2, 'Item name must be at least 2 characters'],
      maxlength: [150, 'Item name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      required: [true, 'Item description is required'],
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Item must belong to a category'],
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Item price is required'],
      min: [0, 'Price cannot be negative'],
    },
    images: [
      {
        type: String, // store URLs of images
        validate: {
          validator: function (v) {
            return /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v);
          },
          message: 'Image must be a valid URL',
        },
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
        lowercase: true,
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    sku: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
    },
    // 🚨 Removed stock field
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 🔹 Indexes
itemSchema.index({ name: 1, category: 1 }, { unique: true });
itemSchema.index({ price: 1 });
itemSchema.index({ tags: 1 });

// 🔹 Virtual field: formatted price
itemSchema.virtual('formattedPrice').get(function () {
  return `₹${this.price.toFixed(2)}`;
});

// 🔹 Static Methods (CRUD + utilities)
itemSchema.statics = {
  // Create new item
  async createItem(data) {
    const item = new this(data);
    return item.save();
  },

  // Update item
  async updateItem(id, updateData) {
    return this.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  },

  // Delete item
  async deleteItem(id) {
    return this.findByIdAndDelete(id);
  },

  // Get item by ID (with category populated)
  async getItemById(id) {
    return this.findById(id).populate('category', 'name isActive');
  },

  // Get all items (filter, pagination, sorting)
  async getAllItems({ filter = {}, page = 1, limit = 10, sort = { createdAt: -1 } }) {
    const skip = (page - 1) * limit;
    const items = await this.find(filter)
      .populate('category', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await this.countDocuments(filter);
    return { items, total, page, pages: Math.ceil(total / limit) };
  },

  // Search items by name/description/tags
  async searchItems(query, page = 1, limit = 10) {
    const regex = new RegExp(query, 'i');
    const filter = { $or: [{ name: regex }, { description: regex }, { tags: regex }] };
    return this.getAllItems({ filter, page, limit });
  },

  // 🚨 Removed updateStock

  // Add rating (update average and count)
  async addRating(id, rating) {
    const item = await this.findById(id);
    if (!item) throw new Error('Item not found');

    const newCount = item.ratings.reviewsCount + 1;
    const newAvg =
      (item.ratings.average * item.ratings.reviewsCount + rating) / newCount;

    item.ratings.average = newAvg;
    item.ratings.reviewsCount = newCount;
    return item.save();
  },
};

module.exports = mongoose.model('Item', itemSchema);
