const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
} = require("../controllers/cartController");

const router = express.Router();

router.get("/", protect, getCart);

router.post("/", protect, addToCart);

router.put("/:product_id", protect, updateCartQuantity);

router.delete("/:product_id", protect, removeFromCart);

module.exports = router;