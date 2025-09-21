// models/Category.js

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, 
  }
);

categorySchema.index({ name: 1 });

categorySchema.statics = {
  // Create a new category
  async createCategory(data) {
    const category = new this(data);
    return category.save();
  },

  // Update a category by ID
  async updateCategory(id, updateData) {
    return this.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  },

  // Delete a category by ID
  async deleteCategory(id) {
    return this.findByIdAndDelete(id);
  },

  // Optional: Get category by ID
  async getCategoryById(id) {
    return this.findById(id).populate('parentCategory');
  },

  // Optional: Get all categories (with optional filter)
  async getAllCategories(filter = {}) {
    return this.find(filter).populate('parentCategory').sort({ name: 1 });
  },
};

module.exports = mongoose.model('Category', categorySchema);
