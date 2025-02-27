const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  companyName: { type: String, required: true },
  productName: {type: String, required:true},
  phone: { type: String, required: true },
  
});

module.exports = mongoose.model("Vendor", vendorSchema, "vendor");
