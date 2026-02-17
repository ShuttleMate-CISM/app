import express from "express";
import mongoose from "mongoose";
import Joi from "joi";
import sanitize from "mongo-sanitize";
import Shop from "../models/shopModel.js";
import admin from "../firebase/firebaseAdmin.js";

// Define strict validation schema for search input
const searchSchema = Joi.object({
  query: Joi.string().min(1).max(30).required(),
});

// Create a new shop
export const createShop = async (req, res, next) => {
  try {
    // Whitelist and validate required fields
    const allowedFields = ['name', 'address', 'phone', 'email', 'category', 'city', 'state'];
    const shopData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        shopData[field] = String(req.body[field]).trim();
      }
    });
    
    // Validate required fields
    if (!shopData.name || !shopData.address || !shopData.phone || !shopData.email) {
      return res.status(400).json({ 
        error: "Missing required fields: name, address, phone, email" 
      });
    }
    
    // Create shop with validated data only
    const shop = await Shop.create(shopData);
    
    // Send notifications to registered devices
    const deviceTokens = []; // Fetch from your database
    const notificationPromises = deviceTokens.map(token =>
      admin.messaging().send({
        token,
        notification: {
          title: "New Shop Created",
          body: `${shopData.name} has been added to Shuttlemate`
        }
      }).catch(() => null)
    );
    
    const results = await Promise.all(notificationPromises);
    const sentCount = results.filter(result => result !== null).length;
    
    res.status(201).json({
      message: "Shop created successfully",
      shop,
      notificationsSent: sentCount
    });
  } catch (error) {
    next(error);
  }
};

// Get all shops
export const getAllShops = async (req, res, next) => {
  try {
    const shops = await Shop.find();
    
    const transformedShops = shops.map(shop => ({
      ...shop.toObject(),
      itemsCount: shop.items.length,
      categoriesCount: shop.categories.length,
    }));

    res.status(200).json({ success: true, shops: transformedShops });
  } catch (error) {
    console.error("Error fetching shops:", error);
    res.status(500).json({ success: false, message: "Failed to fetch shops" });
    next(error);
  }
};

// Get a single shop by ID
export const getShopById = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });
    res.status(200).json({ success: true, shop });
  } catch (error) {
    console.error("Error fetching shop:", error);
    res.status(500).json({ success: false, message: "Failed to fetch shop" });
    next(error);
  }
};

// Update a shop by ID
export const updateShop = async (req, res, next) => {
  try {
    const shop = await Shop.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });
    res.status(200).json({ success: true, shop });
  } catch (error) {
    console.error("Error updating shop:", error);
    res.status(500).json({ success: false, message: "Failed to update shop" });
    next(error);
  }
};

// Delete a shop by ID
export const deleteShop = async (req, res, next) => {
  try {
    const shop = await Shop.findByIdAndDelete(req.params.id);
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });
    res.status(200).json({ success: true, message: "Shop deleted successfully" });
  } catch (error) {
    console.error("Error deleting shop:", error);
    res.status(500).json({ success: false, message: "Failed to delete shop" });
    next(error);
  }
};

// Add a category to a shop
export const addCategoryToShop = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });
    shop.categories.push(req.body);
    await shop.save();
    res.status(201).json({ success: true, shop });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ success: false, message: "Failed to add category" });
    next(error);
  }
};


export const addItemToCategory = async (req, res, next) => {
  try {
    const { name, price, color, itemphoto, categoryId, brand, features, availableqty } = req.body;

    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    const categoryObjectId = new mongoose.Types.ObjectId(categoryId);
    const categoryExists = shop.categories.some(category => category._id.equals(categoryObjectId));
    if (!categoryExists) {
      return res.status(404).json({ success: false, message: "Category not found" });
    }

    const newItem = {
      name,
      price,
      color,
      itemphoto,
      brand,
      features,
      availableqty,
      categoryId
    };

    shop.items.push(newItem);
    await shop.save(); 

    res.status(201).json({ success: true, shop });
  } catch (error) {
    console.error("Error adding item:", error);
    res.status(500).json({ success: false, message: "Failed to add item" });
    next(error);
  }
};



// Remove an item from a shop
export const removeItemFromShop = async (req, res, next) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) return res.status(404).json({ success: false, message: "Shop not found" });
    shop.items = shop.items.filter(item => item._id.toString() !== req.params.itemId);
    await shop.save();
    res.status(200).json({ success: true, shop });
  } catch (error) {
    console.error("Error removing item:", error);
    res.status(500).json({ success: false, message: "Failed to remove item" });
    next(error);
  }
};


// Search items with NoSQL injection prevention
export const searchItems = async (req, res) => {
  try {
    // 1. Sanitize Input (Remove $ signs and malicious operators)
    const cleanQuery = sanitize(req.query.q);

    // 2. Validate Type (Must be a valid string)
    const { error } = searchSchema.validate({ query: cleanQuery });
    if (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid search term",
      });
    }

    // 3. Safe Execution - use sanitized input
    const shops = await Shop.find({
      $or: [
        { name: { $regex: cleanQuery, $options: "i" } },
        { "items.name": { $regex: cleanQuery, $options: "i" } },
      ],
    });

    // Extract matching items from shops
    const items = [];
    shops.forEach((shop) => {
      shop.items.forEach((item) => {
        if (item.name && item.name.match(new RegExp(cleanQuery, "i"))) {
          items.push({ ...item.toObject(), shopName: shop.name, shopId: shop._id });
        }
      });
    });

    res.status(200).json({ success: true, items, shops });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ success: false, message: "Search failed" });
  }
};

