const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  id: Number,
  category: String,
  subcategories: [
    {
      subId: Number,
      name: String,
      products: [
        {
          productId: String,
          name: String,
          img: String,
          price: String,
          likes: Number,
          description: String,
          sizes: [String],
          color: [String]
        }
      ]
    }
  ]
});

const Category = mongoose.model("Category", categorySchema);
module.exports = Category;
