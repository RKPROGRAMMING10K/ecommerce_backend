const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

// Bulk create sample products (for initial setup)
router.post("/sample-products", async (req, res) => {
  try {
    const sampleProducts = [
      {
        name: "Wireless Headphones",
        category: "Electronics",
        price: 99.99,
        description: "High-quality wireless headphones with noise cancellation",
        image:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
      },
      {
        name: "Cotton T-Shirt",
        category: "Clothing",
        price: 19.99,
        description:
          "Comfortable 100% cotton t-shirt available in multiple colors",
        image:
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
      },
      {
        name: "Coffee Maker",
        category: "Home",
        price: 149.99,
        description: "Programmable coffee maker with 12-cup capacity",
        image:
          "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=300&h=300&fit=crop",
      },
      {
        name: "Running Shoes",
        category: "Sports",
        price: 89.99,
        description: "Lightweight running shoes with excellent cushioning",
        image:
          "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop",
      },
      {
        name: "Smartphone",
        category: "Electronics",
        price: 699.99,
        description:
          "Latest smartphone with advanced camera and long battery life",
        image:
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
      },
      {
        name: "Yoga Mat",
        category: "Sports",
        price: 29.99,
        description: "Non-slip yoga mat perfect for all types of yoga practice",
        image:
          "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=300&h=300&fit=crop",
      },
      {
        name: "Desk Lamp",
        category: "Home",
        price: 39.99,
        description:
          "Adjustable LED desk lamp with multiple brightness settings",
        image:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop",
      },
      {
        name: "Jeans",
        category: "Clothing",
        price: 59.99,
        description: "Classic fit jeans made from premium denim",
        image:
          "https://images.unsplash.com/photo-1542272604-787c3835535d?w=300&h=300&fit=crop",
      },
      {
        name: "Bluetooth Speaker",
        category: "Electronics",
        price: 79.99,
        description: "Portable Bluetooth speaker with 360-degree sound",
        image:
          "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300&h=300&fit=crop",
      },
      {
        name: "Cooking Pan Set",
        category: "Home",
        price: 129.99,
        description: "Non-stick cooking pan set with 3 different sizes",
        image:
          "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop",
      },
    ];

    // Check which products already exist
    const existingProducts = await Product.find({
      name: { $in: sampleProducts.map((p) => p.name) },
    });

    const existingNames = existingProducts.map((p) => p.name);
    const productsToCreate = sampleProducts.filter(
      (p) => !existingNames.includes(p.name)
    );

    if (productsToCreate.length === 0) {
      return res.json({
        message: "All sample products already exist",
        existingCount: existingProducts.length,
        createdCount: 0,
      });
    }

    const createdProducts = await Product.insertMany(productsToCreate);

    res.status(201).json({
      message: "Sample products created successfully",
      existingCount: existingProducts.length,
      createdCount: createdProducts.length,
      createdProducts,
    });
  } catch (error) {
    console.error("Create sample products error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Bulk create custom products (accepts array of products)
router.post("/bulk-products", async (req, res) => {
  try {
    const products = req.body;

    // Validate that it's an array
    if (!Array.isArray(products)) {
      return res.status(400).json({
        message: "Request body must be an array of products",
      });
    }

    if (products.length === 0) {
      return res.status(400).json({
        message: "Array cannot be empty",
      });
    }

    // Validate each product
    const errors = [];
    products.forEach((product, index) => {
      if (
        !product.name ||
        !product.category ||
        typeof product.price !== "number" ||
        !product.description
      ) {
        errors.push(
          `Product at index ${index}: Missing required fields (name, category, price, description)`
        );
      }
      if (typeof product.price !== "number" || product.price < 0) {
        errors.push(
          `Product at index ${index}: Price must be a positive number`
        );
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({
        message: "Validation errors",
        errors,
      });
    }

    // Check for existing products
    const productNames = products.map((p) => p.name);
    const existingProducts = await Product.find({
      name: { $in: productNames },
    });

    const existingNames = existingProducts.map((p) => p.name);
    const productsToCreate = products.filter(
      (p) => !existingNames.includes(p.name)
    );

    if (productsToCreate.length === 0) {
      return res.json({
        message: "All products already exist",
        existingCount: existingProducts.length,
        createdCount: 0,
        skippedProducts: existingNames,
      });
    }

    // Create products
    const createdProducts = await Product.insertMany(productsToCreate);

    res.status(201).json({
      message: "Products created successfully",
      totalRequested: products.length,
      existingCount: existingProducts.length,
      createdCount: createdProducts.length,
      skippedProducts: existingNames,
      createdProducts,
    });
  } catch (error) {
    console.error("Bulk create products error:", error);
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

// Clear all products (for testing/reset)
router.delete("/clear-all", async (req, res) => {
  try {
    const result = await Product.deleteMany({});
    res.json({
      message: "All products cleared successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Clear products error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get database stats
router.get("/stats", async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    const categories = await Product.distinct("category");
    const productsWithImages = await Product.countDocuments({
      image: { $ne: null },
    });
    const avgPrice = await Product.aggregate([
      { $group: { _id: null, avgPrice: { $avg: "$price" } } },
    ]);

    res.json({
      totalProducts,
      totalCategories: categories.length,
      categories: categories.sort(),
      productsWithImages,
      averagePrice:
        avgPrice.length > 0 ? Math.round(avgPrice[0].avgPrice * 100) / 100 : 0,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
