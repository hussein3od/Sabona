const pool = require("../config/db");

const admin = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({
      message: "Access denied. Admins only.",
    });
  }

  return pool
    .query("SELECT role FROM users WHERE id = $1", [req.user.id])
    .then((result) => {
      if (result.rows[0]?.role !== "admin") {
        return res.status(403).json({
          message: "Access denied. Admins only.",
        });
      }

      return next();
    })
    .catch((error) => {
      console.error("Admin authorization check failed:", error);

      return res.status(500).json({
        message: "Unable to verify admin permissions",
      });
    });
};

module.exports = admin;