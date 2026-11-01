const pool = require("../config/db");

// GET CART
const getCart = async (req, res) => {
  try {
    const result = await pool.query(
      `
      SELECT
        ci.id,
        ci.product_id,
        ci.quantity,

        p.name_en,
        p.name_ar,
        p.description_en,
        p.description_ar,
        p.price,
        p.stock,
        p.image_url,

        COALESCE(
          (
            SELECT pi.image_url
            FROM product_images pi
            WHERE pi.product_id = p.id
            ORDER BY pi.sort_order ASC, pi.id ASC
            LIMIT 1
          ),
          p.image_url
        ) AS main_image

      FROM cart_items ci

      JOIN products p
        ON ci.product_id = p.id

      WHERE ci.user_id = $1

      ORDER BY ci.id DESC
      `,
      [req.user.id]
    );

    res.json({
      cart: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// ADD TO CART
const addToCart = async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({
        message: "Product ID is required",
      });
    }

    const requestedQuantity = Number(quantity);

    if (
      !Number.isInteger(requestedQuantity) ||
      requestedQuantity < 1
    ) {
      return res.status(400).json({
        message: "Quantity must be at least 1",
      });
    }

    // Check product
    const productResult = await pool.query(
      `
      SELECT id, stock
      FROM products
      WHERE id = $1
      `,
      [product_id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const product = productResult.rows[0];

    if (product.stock <= 0) {
      return res.status(400).json({
        message: "Product is out of stock",
      });
    }

    // Check existing cart item
    const existingResult = await pool.query(
      `
      SELECT id, quantity
      FROM cart_items
      WHERE user_id = $1
      AND product_id = $2
      `,
      [req.user.id, product_id]
    );

    if (existingResult.rows.length > 0) {
      const existingItem = existingResult.rows[0];

      const newQuantity =
        existingItem.quantity + requestedQuantity;

      if (newQuantity > product.stock) {
        return res.status(400).json({
          message: `Only ${product.stock} items available`,
        });
      }

      const result = await pool.query(
        `
        UPDATE cart_items
        SET quantity = $1
        WHERE id = $2
        RETURNING id, product_id, quantity
        `,
        [newQuantity, existingItem.id]
      );

      return res.json({
        message: "Cart updated successfully",
        item: result.rows[0],
      });
    }

    if (requestedQuantity > product.stock) {
      return res.status(400).json({
        message: `Only ${product.stock} items available`,
      });
    }

    const result = await pool.query(
      `
      INSERT INTO cart_items (
        user_id,
        product_id,
        quantity
      )
      VALUES ($1, $2, $3)
      RETURNING id, product_id, quantity
      `,
      [
        req.user.id,
        product_id,
        requestedQuantity,
      ]
    );

    res.status(201).json({
      message: "Product added to cart",
      item: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// UPDATE CART QUANTITY
const updateCartQuantity = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { quantity } = req.body;

    const newQuantity = Number(quantity);

    if (
      !Number.isInteger(newQuantity) ||
      newQuantity < 1
    ) {
      return res.status(400).json({
        message: "Quantity must be at least 1",
      });
    }

    // Check product stock
    const productResult = await pool.query(
      `
      SELECT stock
      FROM products
      WHERE id = $1
      `,
      [product_id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const stock = productResult.rows[0].stock;

    if (newQuantity > stock) {
      return res.status(400).json({
        message: `Only ${stock} items available`,
      });
    }

    const result = await pool.query(
      `
      UPDATE cart_items
      SET quantity = $1
      WHERE user_id = $2
      AND product_id = $3
      RETURNING id, product_id, quantity
      `,
      [
        newQuantity,
        req.user.id,
        product_id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    res.json({
      message: "Cart updated successfully",
      item: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

// REMOVE FROM CART
const removeFromCart = async (req, res) => {
  try {
    const { product_id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM cart_items
      WHERE user_id = $1
      AND product_id = $2
      RETURNING id
      `,
      [req.user.id, product_id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Cart item not found",
      });
    }

    res.json({
      message: "Product removed from cart",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server error",
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartQuantity,
  removeFromCart,
};