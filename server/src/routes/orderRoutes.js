
const express = require("express");
const router = express.Router();

const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAdminOrders,
  updateOrderStatus,
} = require("../controllers/orderController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

// مسارات الأدمن: يجب وضعها قبل /:id
router.get("/admin", protect, admin, getAdminOrders);
router.patch("/:id/status", protect, admin, updateOrderStatus);

// مسارات المستخدم
router.post("/", protect, createOrder);
router.get("/my-orders", protect, getMyOrders);
router.get("/:id", protect, getOrderById);

module.exports = router;
