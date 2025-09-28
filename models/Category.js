// models/Category.js
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      minlength: [2, 'Category name must be at least 2 characters long'],
      maxlength: [100, 'Category name must be at most 100 characters long'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true, // improve query performance
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// 🔹 Indexes for faster queries
categorySchema.index({ name: 1 }, { unique: true });
categorySchema.index({ parentCategory: 1 });

// 🔹 Virtual field to count child categories
categorySchema.virtual('subCategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parentCategory',
});

// 🔹 Pre-hook to prevent circular references
categorySchema.pre('save', async function (next) {
  if (this.parentCategory && this.parentCategory.equals(this._id)) {
    return next(new Error('Category cannot be its own parent.'));
  }
  next();
});

// Static methods
categorySchema.statics = {
  async createCategory(data) {
    const category = new this(data);
    return category.save();
  },

  async updateCategory(id, updateData) {
    return this.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  },

  async deleteCategory(id) {
    // Optional: check for child categories before deleting
    const hasChildren = await this.exists({ parentCategory: id });
    if (hasChildren) {
      throw new Error('Cannot delete category with subcategories.');
    }
    return this.findByIdAndDelete(id);
  },

  async getCategoryById(id) {
    return this.findById(id)
      .populate('parentCategory', 'name')
      .populate('subCategories', 'name isActive');
  },

  async getAllCategories(filter = {}) {
    return this.find(filter)
      .populate('parentCategory', 'name')
      .sort({ createdAt: -1 });
  },
};

module.exports = mongoose.model('Category', categorySchema);
