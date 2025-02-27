const jwt = require("jsonwebtoken");
const Vendor = require("../models/Vendor");

const authMiddleware = async (req, res, next) => {
  const token = req.header("Authorization")?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access Denied! No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if the token has expired
    if (decoded.exp * 1000 < Date.now()) {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }

    req.vendor = await Vendor.findById(decoded.id).select("-password");
    
    if (!req.vendor) {
      return res.status(401).json({ message: "Invalid vendor!" });
    }

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }

    res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
