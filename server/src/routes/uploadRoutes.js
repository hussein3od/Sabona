const express = require("express");
const multer = require("multer");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const {
  uploadProductImage,
} = require("../controllers/uploadController");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, callback) => {
    callback(
      null,
      ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)
    );
  },
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

router.post(
  "/product-image",
  protect,
  admin,
  upload.single("image"),
  uploadProductImage
);

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    const status = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    return res.status(status).json({
      message:
        status === 413
          ? "Image must be 5 MB or smaller"
          : "Invalid image upload",
    });
  }

  return next(error);
});

module.exports = router;