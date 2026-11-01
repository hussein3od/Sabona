const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} = require("../controllers/wishlistController");

const router = express.Router();

router.post("/", protect, addToWishlist);
router.get("/", protect, getWishlist);
router.delete("/:product_id", protect, removeFromWishlist);

module.exports = router;