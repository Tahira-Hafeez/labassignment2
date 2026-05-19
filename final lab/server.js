const jwt = require("jsonwebtoken");
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const Product = require("./model/products");
const Order = require("./model/order");
const User = require("./model/user");
const app = express();
const multer = require("multer");
const path = require("path");
const methodOverride = require("method-override"); /*method-override lets EJS forms send PUT and DELETE
 requests (HTML forms only support GET/POST)*/

const { isLoggedIn, isAdmin } = require("./middleware/auth");
const MongoStore = require("connect-mongo");
const session    = require("express-session");
const bcrypt     = require("bcryptjs");
const flash = require("connect-flash");

mongoose.connect("mongodb://localhost:27017/crumblDB")
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));

app.use(session({
  secret: "crumbl-secret-key",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
  mongoUrl: "mongodb://localhost:27017/crumblDB"
})
}));

app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error   = req.flash("error");
  next();
});

// Make session user available in ALL views automatically
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method")); 

const apiRoutes = require("./routes/api");
app.use("/api/v1", apiRoutes);

// ── MULTER SETUP ──────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads"); // save files here
  },
  filename: function (req, file, cb) {
    // e.g.  1715000000000-cookie.png  (unique name)
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// HOME PAGE
app.get("/", function(req, res) {
  res.render("index");

});

// PRODUCTS PAGE
app.get("/products", async function(req, res) {

  const page = parseInt(req.query.page) || 1;

  const LIMIT = 10;

  const search = req.query.search || "";

  const category = req.query.category || "";

  const minPrice = req.query.minPrice || "";
  const maxPrice = req.query.maxPrice || "";

  const filter = {};

  // search by name
  if(search) {

    filter.name = {
      $regex: search,
      $options: "i"
    };

  }

  // category filter
  if(category) {

    filter.category = category;

  }

  // total products
  const totalProducts = await Product.countDocuments(filter);

  // total pages
  const totalPages = Math.ceil(totalProducts / LIMIT);

  // fetch products
  const products = await Product.find(filter)
  .skip((page - 1) * LIMIT)
  .limit(LIMIT);

 res.render("products", {
  products,
  currentPage: page,
  totalPages,
  search,
  category,
  minPrice,
  maxPrice,
  token: req.session.token || null
});

});


// ════════════════════════════════
//  ADMIN ROUTES (protected)
// ════════════════════════════════
 
app.get("/admin", isAdmin, async (req, res) => {
  const products = await Product.find({});
  res.render("admin/dashboard", { products });
});
 
app.get("/admin/addProduct", isAdmin, (req, res) => {
  res.render("admin/addProduct");
});
 
app.post("/admin/products", isAdmin, upload.single("image"), async (req, res) => {
  const { name, category, price, rating, stock } = req.body;
  if (!name || !category || !price || !rating || !stock) {
    return res.send("All fields are required. <a href='/admin/addProduct'>Go Back</a>");
  }
  const image = req.file ? "/uploads/" + req.file.filename : "/img/cookie1.png";
  await Product.create({ name, category, price, rating, stock, image });
  res.redirect("/admin");
});
 
app.get("/admin/edit/:id", isAdmin, async (req, res) => {
  const product = await Product.findById(req.params.id);
  res.render("admin/edit", { product });
});
 
app.put("/admin/products/:id", isAdmin, upload.single("image"), async (req, res) => {
  const { name, category, price, rating, stock } = req.body;
  if (!name || !category || !price || !rating || !stock) {
    return res.send("All fields are required. <a href='/admin'>Go Back</a>");
  }
  const updateData = { name, category, price, rating, stock };
  if (req.file) updateData.image = "/uploads/" + req.file.filename;
  await Product.findByIdAndUpdate(req.params.id, updateData);
  res.redirect("/admin");
});
 
app.delete("/admin/products/:id", isAdmin, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.redirect("/admin");
});


// Protect checkout (example)
app.get("/checkout", isLoggedIn, (req, res) => res.render("checkout"));


app.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const match = user && await bcrypt.compare(req.body.password, user.password);
  if (!match) {
    req.flash("error", "Invalid email or password.");
    return res.redirect("/login");
  }
  req.session.user = { id: user._id, name: user.name, role: user.role };
  console.log("SESSION USER:", req.session.user); 
  const token = jwt.sign(
  { user_id: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRES_IN }
);
req.session.token = token;

  req.flash("success", `Welcome back, ${user.name}!`);
  res.redirect("/");
});

app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      req.flash("error", "Email already registered.");
      return res.redirect("/register");
    }
    await User.create({ name, email, password });
    req.flash("success", "Account created! Please log in.");
    res.redirect("/login");
  } catch (err) {
    req.flash("error", "Something went wrong.");
    res.redirect("/register");
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login");
  });
});

async function getSalesStats() {
  const totalOrders = await Order.countDocuments();

  // Revenue: unwind products, lookup price from Product, multiply & sum
  const revenueResult = await Order.aggregate([
    { $unwind: "$products" },
    {
      $lookup: {
        from: "products",
        let: { pid: { $toObjectId: "$products.productId" } },
        pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$pid"] } } }],
        as: "productInfo"
      }
    },
    { $unwind: "$productInfo" },
    {
      $group: {
        _id: null,
        total: {
          $sum: { $multiply: ["$productInfo.price", "$products.quantity"] }
        }
      }
    }
  ]);
  const totalRevenue = revenueResult[0]?.total || 0;

  // Top-selling product by total quantity
  const topProductData = await Order.aggregate([
    { $unwind: "$products" },
    {
      $group: {
        _id: "$products.productId",
        totalSold: { $sum: "$products.quantity" }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 1 },
    {
      $lookup: {
        from: "products",
        let: { pid: { $toObjectId: "$_id" } },
        pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$pid"] } } }],
        as: "product"
      }
    },
    { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } }
  ]);
  const topProduct = topProductData[0]
    ? { name: topProductData[0].product?.name || "N/A", sold: topProductData[0].totalSold }
    : { name: "N/A", sold: 0 };

const rawOrders = await Order.find({}).sort({ createdAt: -1 }).limit(5);

const recentOrders = await Promise.all(rawOrders.map(async (order) => {
  const productsWithNames = await Promise.all(order.products.map(async (p) => {
    const product = await Product.findById(new mongoose.Types.ObjectId(p.productId)).select("name");
    return { name: product ? product.name : "Unknown", quantity: p.quantity };
  }));
  return { _id: order._id, createdAt: order.createdAt, products: productsWithNames };
}));


  return { totalRevenue, totalOrders, topProduct, recentOrders };
}
app.get("/sales", isAdmin, async (req, res) => {
  const stats = await getSalesStats();
  res.render("sales", stats);
});

app.get("/api/sales-data", isAdmin, async (req, res) => {
  try {
    const { totalRevenue, totalOrders, topProduct } = await getSalesStats();
    res.json({ totalRevenue, totalOrders, topProduct });
  } catch (err) {
    res.status(500).json({ error: "Server error." });
  }
});

app.get("/login", (req, res) => res.render("login"));

app.get("/register", (req, res) => res.render("register"));

// Start the server on port 3000
app.listen(3000, function () {
  console.log("Server Started at localhost:3000");
});

// Log a message to indicate that the server.js file is being executed
console.log("Console from server.js file");
