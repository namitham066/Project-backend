const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const ProductRoutes = require("./routes/Productroutes"); 
const CategoryRoutes = require("./routes/Categoryoutes"); 
const vendorRoutes = require("./routes/vendorRoutes")
const cartRoutes = require("./routes/cartRoutes");

dotenv.config();
const app = express();


app.use(cors());
app.use(express.json());


connectDB();


app.use("/api/auth", authRoutes);
app.use("/api/products", ProductRoutes); 
app.use("/api/categories", CategoryRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/cart", cartRoutes);


app.get("/", (req, res) => {
  res.send("API is running...");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
