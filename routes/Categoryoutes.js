const express = require("express");
const Category = require("../models/category"); 
const Products = require("../models/Products");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    const products = await Products.find();
    console.log(products, "PRODUCTTTTT");
    
    categories.forEach(category => {
      category.subcategories.forEach(subcategory => {
        subcategory.products = [];  
        products.forEach(product => {
          
          if (product.category === category.category && product.subcategory === subcategory.name) {
            subcategory.products.push(product);  
          }
        });
      });
    });
    

    
    

    
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


router.get("/:category", async (req, res) => {
  try {
    const { category } = req.params;
    
    
    const foundCategory = await Category.findOne({ category: category });

    if (!foundCategory) {
      return res.status(404).json({ message: "Category not found" });
    }
    const products = await Products.find();
    console.log(products, "PRODUCTTTTT");
    
    // categories.forEach(category => {
      foundCategory.subcategories.forEach(subcategory => {
        subcategory.products = [];  
        products.forEach(product => {
          
          if (product.category === foundCategory.category && product.subcategory === subcategory.name) {
            subcategory.products.push(product);  
          }
        });
      });
    // });

    res.json(foundCategory.subcategories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching subcategories" });
  }
});

module.exports = router;
