const bcrypt = require("bcryptjs");
const Customer = require("../models/Customers");
const Vendor = require("../models/Vendor");
const Admin = require("../models/Admin");

exports.signupCustomer = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const existingUser = await Customer.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Customer({ name, email, password: hashedPassword, phone });
    await newUser.save();

    res.status(201).json({ message: "Customer registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error during signup", error: error.message });
  }
};

exports.signupVendor = async (req, res) => {
  try {
    const { name, email, password, phone, companyName, productName } = req.body;
    const existingUser = await Vendor.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Vendor({ name, email, password: hashedPassword, phone, companyName, productName });
    await newUser.save();

    res.status(201).json({ message: "Vendor registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error during signup", error: error.message });
  }
};

exports.signupAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await Admin.findOne({ email });
    if (existingUser) return res.status(400).json({ message: "Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Admin({ username, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "Admin registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Error during signup", error: error.message });
  }
};
