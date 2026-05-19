const mongoose = require("mongoose");
const Product  = require("./model/products");
const products = require("./model/products");

mongoose.connect("mongodb://localhost:27017/crumblDB");

const cookies = [
  { name: "S'mores Cookie",             category: "Weekly",   price: 850,  rating: 4.8, stock: 30, image: "/img/cookie8.png" },
  { name: "Biscoff Skillet Cookie",     category: "Weekly",   price: 950,  rating: 4.7, stock: 25, image: "/img/cookie.png"  },
  { name: "Raspberry Cheesecake",       category: "Weekly",   price: 950,  rating: 4.9, stock: 20, image: "/img/cookie9.png" },
  { name: "Buckeye Brownie Cookie",     category: "Weekly",   price: 850,  rating: 4.6, stock: 18, image: "/img/cookie3.png" },
  { name: "Semi-Sweet Chocolate Chunk", category: "Classic",  price: 750,  rating: 4.5, stock: 50, image: "/img/cookie1.png" },
  { name: "Pink Sugar Cookie",          category: "Classic",  price: 750,  rating: 4.7, stock: 60, image: "/img/cookie7.png" },
  { name: "Chocolate Crumb ft. OREO",   category: "Classic",  price: 850,  rating: 4.8, stock: 45, image: "/img/cookie6.png" },
  { name: "Lemon Glaze Cookie",         category: "Seasonal", price: 850,  rating: 4.3, stock: 22, image: "/img/cookie1.png" },
  { name: "Red Velvet Cookie",          category: "Classic",  price: 850,  rating: 4.6, stock: 35, image: "/img/cookie3.png" },
  { name: "Snickerdoodle Cookie",       category: "Classic",  price: 750,  rating: 4.4, stock: 40, image: "/img/cookie9.png" },
  { name: "Peanut Butter Cookie",       category: "Classic",  price: 750,  rating: 4.5, stock: 55, image: "/img/cookie8.png" },
  { name: "Confetti Cake Cookie",       category: "Seasonal", price: 950,  rating: 4.7, stock: 28, image: "/img/cookie7.png" },
  { name: "Salted Caramel Cheesecake",  category: "Weekly",   price: 1050, rating: 4.9, stock: 15, image: "/img/cookie6.png" },
  { name: "Brownie Batter Cookie",      category: "Weekly",   price: 950,  rating: 4.8, stock: 20, image: "/img/cookie3.png" },
  { name: "Maple Cinnamon Cookie",      category: "Seasonal", price: 850,  rating: 4.2, stock: 18, image: "/img/cookie1.png" },
  { name: "Strawberry Shortcake",       category: "Seasonal", price: 950,  rating: 4.6, stock: 22, image: "/img/cookie9.png" },
  { name: "Birthday Cake Cookie",       category: "Classic",  price: 850,  rating: 4.7, stock: 48, image: "/img/cookie8.png" },
  { name: "Double Fudge Brownie",       category: "Classic",  price: 850,  rating: 4.8, stock: 42, image: "/img/cookie3.png" },
  { name: "Cookies & Cream Cookie",     category: "Weekly",   price: 950,  rating: 4.9, stock: 17, image: "/img/cookie6.png" },
  { name: "Pumpkin Pie Cookie",         category: "Seasonal", price: 950,  rating: 4.5, stock: 10, image: "/img/cookie7.png" },
  { name: "Key Lime Pie Cookie",        category: "Seasonal", price: 950,  rating: 4.4, stock: 14, image: "/img/cookie9.png" },
  { name: "Almond Joy Cookie",          category: "Weekly",   price: 850,  rating: 4.6, stock: 19, image: "/img/cookie1.png" },
  { name: "Churro Cookie",              category: "Seasonal", price: 850,  rating: 4.3, stock: 21, image: "/img/cookie8.png" },
  { name: "Mint Chocolate Chip Cookie", category: "Classic",  price: 750,  rating: 4.5, stock: 38, image: "/img/cookie3.png" },
];

async function seed() {
  await products.deleteMany({});
  await products.insertMany(cookies);
  console.log("24 cookies seeded!");
  mongoose.connection.close();
}

seed();