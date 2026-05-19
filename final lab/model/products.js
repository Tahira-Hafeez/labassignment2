const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  price: {
    type: Number,
    required: true
  },

  category: {
    type: String,
    required: true
  },

  rating: {
    type: Number,
    min: 0,
    max: 5
  },

  stock: {
    type: Number,
    default: 0
  },

  image: {
    type: String,
    default: "/img/cookie1.png"
  }
});

module.exports = mongoose.model("Product", productSchema);