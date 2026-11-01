const express = require("express");

const {
  signup,
  login,
  getMe,
} = require("../controllers/authController");

const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.get("/me", protect, getMe);

router.get("/admin-test", protect, admin, (req, res) => {
  res.json({
    message: "Welcome Admin",
  });
});

module.exports = router;