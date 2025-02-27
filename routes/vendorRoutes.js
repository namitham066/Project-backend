const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authmiddleware"); 
const Product = require("../models/Products");


router.post("/add-product", authMiddleware, async (req, res) => {
  try {
    
    if (!req.vendor || !req.vendor._id) {
      return res.status(401).json({ message: "Authentication error: Please login as a vendor" });
    }

    
    const { title, category, subcategory, price, description, img, quantity, sizes, color } = req.body;

   
    if (!title || !category || !subcategory || !price || !description || !img || !quantity) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    
    const newProduct = new Product({
      vendorId: req.vendor._id, 
      title,
      category,
      subcategory,
      price,
      description,
      img,
      quantity,
      sizes: sizes || [],
      color: color || [],
      totallikes: 0,
    });

    
    await newProduct.save();

    res.status(201).json({ message: "Product added successfully!", product: newProduct });
  } catch (error) {
    console.error(" Error adding product:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

module.exports = router;
