const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const jwt = require("jsonwebtoken");

// Middleware to verify if the logged-in user is a customer
const verifyCustomer = (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access denied. Please log in as a customer." });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (verified.role !== "customer") {
      return res.status(403).json({ message: "Only customers can add items to the cart." });
    }
    req.user = verified; 
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token." });
  }
};


router.post("/add-to-cart", verifyCustomer, async (req, res) => {
    console.log("Received Request Body:", req.body);
    console.log("Headers:", req.headers); 
  try {
    const { productId, quantity } = req.body;
    const product = { productId, quantity };
    
    const userId = req.user.id; 

    console.log("Extracted User ID:", userId); 
    console.log("Extracted Product:", product); 


    if (!userId || !product) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        products: [product],
      });
    } else {
        const existingProduct = cart.products.find((p) => String(p.productId) === String(product.productId));

      if (existingProduct) {
        existingProduct.quantity += 1;
      } else {
        cart.products.push(product);
      }
    }

    await cart.save();
    res.status(200).json({ message: "Cart updated successfully", cart });
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
