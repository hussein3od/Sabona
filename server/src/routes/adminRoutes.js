
const express = require("express");
const pool = require("../config/db");
const protect = require("../middleware/authMiddleware");
const admin = require("../middleware/adminMiddleware");

const router = express.Router();

// إحصائيات لوحة تحكم الأدمن
router.get("/stats", protect, admin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        COALESCE(
          (SELECT SUM(total_amount)
           FROM orders
           WHERE status = 'delivered'),
          0
        ) AS "totalSales",

        (SELECT COUNT(*)
         FROM orders) AS "totalOrders",

        (SELECT COUNT(*)
         FROM users
         WHERE role IS DISTINCT FROM 'admin') AS "totalCustomers",

        (SELECT COUNT(*)
         FROM products) AS "totalProducts"
    `);

    const row = result.rows[0];

    return res.json({
      stats: {
        totalSales: Number(row.totalSales),
        totalOrders: Number(row.totalOrders),
        totalCustomers: Number(row.totalCustomers),
        totalProducts: Number(row.totalProducts),
      },
    });
  } catch (error) {
    console.error("Get admin stats error:", error);

    return res.status(500).json({
      message: "Failed to fetch dashboard statistics",
    });
  }
});

module.exports = router;
