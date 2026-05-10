const express = require("express");
const mongoose = require("mongoose");
const Product = require("./model/products");

const multer = require("multer");
const path = require("path");
const methodOverride = require("method-override"); /*method-override lets EJS forms send PUT and DELETE
 requests (HTML forms only support GET/POST)*/

const app = express();

mongoose.connect("mongodb://localhost:27017/crumblDB")
.then(() => console.log("MongoDB Connected"))
.catch((err) => console.log(err));

app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true })); // NEW — parses form data
app.use(methodOverride("_method")); 


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
  maxPrice
});

});

// ════════════════════════════════
//  ADMIN ROUTES
// ════════════════════════════════

// DASHBOARD — list all products
app.get("/admin", async function (req, res) {
  const products = await Product.find({});
  res.render("admin/dashboard", { products });
});

// CREATE — show the add form
app.get("/admin/addProduct", function (req, res) {
  res.render("admin/addProduct");
});

// CREATE — handle form submission
app.post("/admin/products", upload.single("image"), async function (req, res) {
  const { name, category, price, rating, stock } = req.body;

  // Basic validation — if any field is missing, go back
  if (!name || !category || !price || !rating || !stock) {
    return res.send("All fields are required. <a href='/admin/new'>Go Back</a>");
  }

  // Image path: use uploaded file OR a default
  const image = req.file ? "/uploads/" + req.file.filename : "/img/cookie1.png";

  await Product.create({ name, category, price, rating, stock, image });
  res.redirect("/admin");
});

// EDIT — show pre-filled edit form
app.get("/admin/edit/:id", async function (req, res) {
  const product = await Product.findById(req.params.id);
  res.render("admin/edit", { product });
});

// UPDATE — save changes
app.put("/admin/products/:id", upload.single("image"), async function (req, res) {
  const { name, category, price, rating, stock } = req.body;

  if (!name || !category || !price || !rating || !stock) {
    return res.send("All fields are required. <a href='/admin'>Go Back</a>");
  }

  const updateData = { name, category, price, rating, stock };

  // Only update the image if a new one was uploaded
  if (req.file) {
    updateData.image = "/uploads/" + req.file.filename;
  }

  await Product.findByIdAndUpdate(req.params.id, updateData);
  res.redirect("/admin");
});

// DELETE — remove product
app.delete("/admin/products/:id", async function (req, res) {
  await Product.findByIdAndDelete(req.params.id);
  res.redirect("/admin");
});

// Start the server on port 3000
app.listen(3000, function () {
  console.log("Server Started at localhost:3000");
});

// Log a message to indicate that the server.js file is being executed
console.log("Console from server.js file");