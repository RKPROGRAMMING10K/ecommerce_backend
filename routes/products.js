const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

// Get all products with optional filtering and search
router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = {};

    // Filter by category
    if (category) {
      query.category = { $regex: category, $options: "i" };
    }

    // Search in name and description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    let page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 12;
    if (limit > 100) limit = 100;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Product.countDocuments(query),
    ]);

    res.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit,
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Create product - Enhanced with validation
router.post("/", async (req, res) => {
  try {
    const { name, category, price, description, image } = req.body;

    // Validation
    if (!name || !category || !price || !description) {
      return res.status(400).json({
        message:
          "Missing required fields: name, category, price, and description are required",
      });
    }

    if (price < 0) {
      return res.status(400).json({
        message: "Price must be a positive number",
      });
    }

    // Check if product with same name already exists
    const existingProduct = await Product.findOne({ name: name.trim() });
    if (existingProduct) {
      return res.status(400).json({
        message: "Product with this name already exists",
      });
    }

    const product = new Product({
      name: name.trim(),
      category: category.trim(),
      price: parseFloat(price),
      description: description.trim(),
      image: image ? image.trim() : null,
    });

    await product.save();
    res.status(201).json({
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        message: "Validation error",
        errors: validationErrors,
      });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update product
router.put("/:id", async (req, res) => {
  try {
    const { name, category, price, description, image } = req.body;
    const productId = req.params.id;

    // Find the product
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Validation
    if (price !== undefined && price < 0) {
      return res.status(400).json({
        message: "Price must be a positive number",
      });
    }

    // Check if another product with the same name exists (if name is being updated)
    if (name && name.trim() !== product.name) {
      const existingProduct = await Product.findOne({
        name: name.trim(),
        _id: { $ne: productId },
      });
      if (existingProduct) {
        return res.status(400).json({
          message: "Another product with this name already exists",
        });
      }
    }

    // Update fields
    if (name) product.name = name.trim();
    if (category) product.category = category.trim();
    if (price !== undefined) product.price = parseFloat(price);
    if (description) product.description = description.trim();
    if (image !== undefined) product.image = image ? image.trim() : null;

    await product.save();
    res.json({
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map(
        (err) => err.message
      );
      return res.status(400).json({
        message: "Validation error",
        errors: validationErrors,
      });
    }
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete product
router.delete("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({
      message: "Product deleted successfully",
      product,
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get all unique categories
router.get("/meta/categories", async (req, res) => {
  try {
    const categories = await Product.distinct("category");
    res.json({ categories: categories.sort() });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
