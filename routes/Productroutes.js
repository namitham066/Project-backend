const express = require("express");
const router = express.Router();
const fs = require("fs");
const authenticateVendor = require("../middleware/authmiddleware");
const Product = require("../models/Products"); 
const Category = require("../models/category"); 


router.post("/add", authenticateVendor, async (req, res) => {
  try {
    console.log("Received Data:", req.body);
    console.log("Authenticated Vendor:", req.vendor);

    if (!req.vendor) {
      return res.status(403).json({ message: "Access denied! Authentication failed." });
    }

    const vendorId = req.vendor._id; 
    const { title, category, subcategory, price, description, img, sizes, color, quantity, totallikes } = req.body;

    if (!vendorId) {
      return res.status(403).json({ message: "Access denied! You must be a vendor to add products" });
    }

    const newProduct = new Product({
      vendorId, 
      title,
      category,
      subcategory,
      price,
      description,
      img,
      sizes,
      color,
      quantity, 
      totallikes,
    });

    await newProduct.save();

    const categoryDoc = await Category.findOne({ category });
    if (!categoryDoc) {
      return res.status(400).json({ error: "Category not found" });
    }

    const subcategoryIndex = categoryDoc.subcategories.findIndex(sub => sub.name === subcategory);
    if (subcategoryIndex === -1) {
      return res.status(400).json({ error: "Subcategory not found" });
    }

    categoryDoc.subcategories[subcategoryIndex].products.push({
      productId: newProduct._id,
      title, 
      img,
      price,
      description,
      sizes,
      color,
      quantity 
    });

    await categoryDoc.save();

    res.status(201).json({ message: "Product added successfully!", newProduct });
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Server error", error });
  }
});


router.get("/subcategory/:subcategory", async (req, res) => {
  try {
    const subcategory = req.params.subcategory;

    
    const products = await Product.find({ subcategory });

    if (!products.length) {
      return res.status(404).json({ message: "No products found in this subcategory" });
    }

    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching subcategory products:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});


router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});


router.get("/getProducts", async (req, res) => {
  try {
    const dbProducts = await Product.find(); 
    let jsonProducts = [];

    try {
      const data = fs.readFileSync("data.json", "utf-8");
      jsonProducts = JSON.parse(data); 
    } catch (jsonError) {
      console.error("Error reading data.json:", jsonError);
    }

    const allProducts = [...jsonProducts, ...dbProducts]; 
    res.json(allProducts);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products", error });
  }
});


router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
