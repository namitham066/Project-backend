const express = require("express");
const { signupCustomer, signupVendor, signupAdmin } = require("../controllers/authController");
const Customer = require("../models/Customers");
const Vendor = require("../models/Vendor");
const Admin = require("../models/Admin");
const Cart = require("../models/Cart"); // Assuming you have a Cart model
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const router = express.Router();

const findUser = async (emailOrPhone) => {
  let user = await Customer.findOne({ $or: [{ email: emailOrPhone }, { phone_number: emailOrPhone }] });
  if (user) return { user, role: "customer" };

  user = await Vendor.findOne({ $or: [{ email: emailOrPhone }, { phone_number: emailOrPhone }] });
  if (user) return { user, role: "vendor" };

  user = await Admin.findOne({ username: emailOrPhone });
  if (user) return { user, role: "admin" };

  return null;
};

router.post("/login", async (req, res) => {
  const { emailOrPhone, password } = req.body;
  console.log("\n🔹 Login Attempt Received");
  console.log(" Email/Phone:", emailOrPhone);
  console.log(" Password:", password);

  try {
    const userData = await findUser(emailOrPhone);
    console.log(" User Data Found:", userData ? userData.user : "User not found");

    if (!userData) {
      console.log("No user found for:", emailOrPhone);
      return res.status(401).json({ message: "Invalid email/phone or password." });
    }

    const { user, role } = userData;
    console.log(" Checking password...");
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password Match:", isMatch);

    if (!isMatch) {
      console.log(" Incorrect password for:", emailOrPhone);
      return res.status(401).json({ message: "Invalid email/phone or password." });
    }

    const token = jwt.sign({ id: user._id, role }, process.env.JWT_SECRET, { expiresIn: "1h" });
    console.log(" Generated JWT Token:", token);

    res.json({
      message: "Login successful!",
      token,
      role,
      vendorId: role === "vendor" ? user._id : null,
    });
  } catch (error) {
    console.error(" Login error:", error);
    res.status(500).json({ message: "Server error." });
  }
});

// Middleware to verify if the logged-in user is a customer
const verifyCustomer = (req, res, next) => {
  const token = req.header("Authorization");

  if (!token) {
    return res.status(401).json({ message: "Access denied. Please log in as a customer." });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (verified.role !== "customer") {
      return res.status(403).json({ message: "Only customers can add items to the cart." });
    }
    req.user = verified; // Store user data in request
    next();
  } catch (err) {
    res.status(400).json({ message: "Invalid or expired token." });
  }
};

// Route to add product to cart (Only for customers)
// router.post("/add-to-cart", verifyCustomer, async (req, res) => {
//   const { productId, quantity } = req.body;
//   const customerId = req.user.id; // Extracted from JWT token

//   try {
//     const cartItem = new Cart({ customerId, productId, quantity });
//     await cartItem.save();

//     res.json({ message: "Item added to cart successfully!" });
//   } catch (error) {
//     console.error("Error adding item to cart:", error);
//     res.status(500).json({ message: "Server error while adding to cart." });
//   }
// });

router.post("/signup/customer", signupCustomer);
router.post("/signup/vendor", signupVendor);
router.post("/signup/admin", signupAdmin);

const findUserByEmail = async (email) => {
  return (
    (await Customer.findOne({ email })) ||
    (await Vendor.findOne({ email })) ||
    (await Admin.findOne({ email }))
  );
};

const updateUserPassword = async (email, hashedPassword) => {
  const userTypes = [Customer, Vendor, Admin];
  for (let model of userTypes) {
    const user = await model.findOne({ email });
    if (user) {
      user.password = hashedPassword;
      await user.save();
      return true;
    }
  }
  return false;
};

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: "1h" });
    const resetLink = `http://localhost:3000/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>Hello ${user.first_name || "User"},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}" target="_blank">Reset Password</a>
        <p>If you did not request this, please ignore this email.</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.json({ message: "Password reset link sent to your email." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error sending reset link." });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await findUserByEmail(decoded.email);
    if (!user) {
      return res.status(400).json({ message: "Invalid token or user not found." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    const isUpdated = await updateUserPassword(decoded.email, hashedPassword);

    if (!isUpdated) {
      return res.status(500).json({ message: "Error updating password." });
    }

    res.json({ message: "Password reset successful. You can now log in." });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: "Invalid or expired token." });
  }
});

module.exports = router;
