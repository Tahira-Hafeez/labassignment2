const express  = require("express");
const router   = express.Router();
const jwt      = require("jsonwebtoken");
const bcrypt   = require("bcryptjs");
const User     = require("../model/user");
const Product  = require("../model/products");
const Order    = require("../model/order");
const {verifyToken} = require("../middleware/auth");

// ─────────────────────────────────────────
// PUBLIC: POST /api/v1/auth/login
// ─────────────────────────────────────────
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // 2. Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // 3. Sign JWT with user_id and role
    const token = jwt.sign(
      { user_id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // 4. Return token to client
    res.json({ message: "Login successful", token });

  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// ─────────────────────────────────────────
// PUBLIC: GET /api/v1/products
// ─────────────────────────────────────────
router.get("/products", async (req, res) => {
  try {
    const page     = parseInt(req.query.page) || 1;
    const LIMIT    = 10;
    const search   = req.query.search   || "";
    const category = req.query.category || "";
    const filter   = {};

    if (search)   filter.name     = { $regex: search, $options: "i" };
    if (category) filter.category = category;

    const totalProducts = await Product.countDocuments(filter);
    const totalPages    = Math.ceil(totalProducts / LIMIT);
    const products      = await Product.find(filter)
                            .skip((page - 1) * LIMIT)
                            .limit(LIMIT);

    res.json({ totalProducts, totalPages, currentPage: page, products });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// ─────────────────────────────────────────
// PUBLIC: GET /api/v1/products/:id
// ─────────────────────────────────────────
router.get("/products/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found." });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// ─────────────────────────────────────────
// PROTECTED: POST /api/v1/orders
// ─────────────────────────────────────────
router.post("/orders", verifyToken, async (req, res) => {
  try {
    const { products } = req.body; // [{ productId, quantity }]

    const order = await Order.create({
      userId:   req.user.user_id, // from decoded JWT
      products
    });

    res.status(201).json({ message: "Order placed successfully.", order });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

// ─────────────────────────────────────────
// PROTECTED: GET /api/v1/user/profile
// ─────────────────────────────────────────
router.get("/user/profile", verifyToken, async (req, res) => {
  try {
    // req.user.user_id comes from the decoded JWT
    const user = await User.findById(req.user.user_id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;