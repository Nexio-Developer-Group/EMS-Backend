// controllers/itemController.js
const mongoose = require('mongoose');
const Item = require('../models/Item');
const { isValidObjectId } = require('mongoose');

// Utility: validate MongoDB ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Create a new item
const createItem = async (req, res) => {
  try {
    const item = await Item.createItem(req.body);
    res.status(201).json({
      status: 1,
      data: item,
      message: 'Item created successfully',
      error: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 0,
      data: null,
      message: 'Failed to create item',
      error: error.message,
    });
  }
};

// Update item
const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 0,
        message: 'Invalid item ID',
        error: 'Invalid ID format',
      });
    }

    const updatedItem = await Item.updateItem(id, req.body);
    if (!updatedItem) {
      return res.status(404).json({
        status: 0,
        message: 'Item not found',
        error: 'No item with this ID',
      });
    }

    res.json({
      status: 1,
      data: updatedItem,
      message: 'Item updated successfully',
      error: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 0,
      message: 'Failed to update item',
      error: error.message,
    });
  }
};

// Delete item
const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 0,
        message: 'Invalid item ID',
        error: 'Invalid ID format',
      });
    }

    const deletedItem = await Item.deleteItem(id);
    if (!deletedItem) {
      return res.status(404).json({
        status: 0,
        message: 'Item not found',
        error: 'No item with this ID',
      });
    }

    res.json({
      status: 1,
      data: deletedItem,
      message: 'Item deleted successfully',
      error: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 0,
      message: 'Failed to delete item',
      error: error.message,
    });
  }
};

// Get single item
const getItemById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 0,
        message: 'Invalid item ID',
        error: 'Invalid ID format',
      });
    }

    const item = await Item.getItemById(id);
    if (!item) {
      return res.status(404).json({
        status: 0,
        message: 'Item not found',
        error: 'No item with this ID',
      });
    }

    res.json({
      status: 1,
      data: item,
      message: 'Item fetched successfully',
      error: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 0,
      message: 'Failed to fetch item',
      error: error.message,
    });
  }
};


const getAllItems = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
      category,
      activeOnly,
      search,
    } = req.query;

    const filter = {};

    if (category && isValidObjectId(category)) filter.category = category;
    if (activeOnly === 'true') filter.isActive = true;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sort = { [sortBy]: order === 'asc' ? 1 : -1 };

    const result = await Item.getAllItems({
      filter,
      page: Number(page),
      limit: Number(limit),
      sort,
    });

    res.json({
      status: 1,
      ...result,
      message: 'Items fetched successfully',
      error: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 0,
      message: 'Failed to fetch items',
      error: error.message,
    });
  }
};


// Search items
const searchItems = async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    if (!q) {
      return res.status(400).json({
        status: 0,
        message: 'Search query is required',
        error: 'Missing query parameter',
      });
    }

    const result = await Item.searchItems(q, Number(page), Number(limit));

    res.json({
      status: 1,
      ...result,
      message: 'Search results fetched successfully',
      error: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 0,
      message: 'Failed to search items',
      error: error.message,
    });
  }
};

// Add rating
const addRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        status: 0,
        message: 'Invalid item ID',
        error: 'Invalid ID format',
      });
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      return res.status(400).json({
        status: 0,
        message: 'Rating must be a number between 1 and 5',
        error: 'Invalid rating value',
      });
    }

    const updatedItem = await Item.addRating(id, rating);
    res.json({
      status: 1,
      data: updatedItem,
      message: 'Rating added successfully',
      error: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 0,
      message: 'Failed to add rating',
      error: error.message,
    });
  }
};

module.exports = {
  createItem,
  updateItem,
  deleteItem,
  getItemById,
  getAllItems,
  searchItems,
  addRating,
};
