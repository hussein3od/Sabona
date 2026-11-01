const express = require("express");

const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductImages,
  deleteProductImage, // تأكد من استيراد الدالة الجديدة
} = require("../controllers/productController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", protect, admin, createProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);
router.post("/:id/images", protect, admin, addProductImages);

// 🔴 راوت حذف الصورة الإضافية من جدول product_images و Supabase
router.delete("/:id/images/:imageId", protect, admin, deleteProductImage);

module.exports = router;