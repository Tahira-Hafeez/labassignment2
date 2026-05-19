const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products:  [{ productId: String, quantity: Number }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Order", orderSchema);