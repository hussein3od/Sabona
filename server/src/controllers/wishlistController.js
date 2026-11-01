const pool = require("../config/db");

const addToWishlist = async (req, res) => {
  try {
    const { product_id } = req.body;

    if (!product_id) {
      return res.status(400).json({
        message: "Product ID is required",
      });
    }

    const existing = await pool.query(
      `SELECT id
       FROM wishlist
       WHERE user_id = $1 AND product_id = $2`,
      [req.user.id, product_id]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        message: "Product is already in wishlist",
      });
    }

    await pool.query(
      `INSERT INTO wishlist (user_id, product_id)
       VALUES ($1, $2)`,
      [req.user.id, product_id]
    );

    res.status(201).json({
      message: "Product added to wishlist",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

const removeFromWishlist = async (req, res) => {
  try {
    const { product_id } = req.params;

    await pool.query(
      `DELETE FROM wishlist
       WHERE user_id = $1 AND product_id = $2`,
      [req.user.id, product_id]
    );

    res.json({
      message: "Product removed from wishlist",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};
const getWishlist = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT product_id
       FROM wishlist
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({
      wishlist: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  addToWishlist,
  removeFromWishlist,
  getWishlist
};