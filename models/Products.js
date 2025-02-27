const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,  
    ref: "Vendor",  
    required: true,
  },
  title: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  img: { type: String, required: true },
  quantity: { type: Number, required: true },
  sizes: { type: [String], default: [] },
  color: { type: [String], default: [] },
  totallikes: { type: Number, default: 0 },
});

module.exports = mongoose.model("Product", productSchema);
