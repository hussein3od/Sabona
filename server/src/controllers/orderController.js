
const pool = require("../config/db");

const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

// إنشاء طلب جديد من سلة المستخدم
const createOrder = async (req, res) => {
  let client;

  try {
    const userId = req.user.id;
    const { phone, city, address } = req.body;

    if (!phone?.trim() || !city?.trim() || !address?.trim()) {
      return res.status(400).json({
        message: "Phone, city and address are required",
      });
    }

    client = await pool.connect();
    await client.query("BEGIN");

    const userResult = await client.query(
      "SELECT name FROM users WHERE id = $1",
      [userId]
    );

    if (!userResult.rows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "User not found" });
    }

    const customerName = userResult.rows[0].name;

    const cartResult = await client.query(
      `SELECT
         ci.product_id,
         ci.quantity,
         p.name_en,
         p.name_ar,
         p.price,
         p.stock
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       WHERE ci.user_id = $1
       FOR UPDATE OF p`,
      [userId]
    );

    const items = cartResult.rows;

    if (!items.length) {
      await client.query("ROLLBACK");
      return res.status(400).json({ message: "Your cart is empty" });
    }

    for (const item of items) {
      if (!Number.isInteger(Number(item.quantity)) || Number(item.quantity) < 1) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: "Invalid product quantity",
        });
      }

      if (Number(item.stock) < Number(item.quantity)) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: `Not enough stock for ${item.name_en}`,
        });
      }
    }

    const subtotal = items.reduce(
      (sum, item) =>
        sum + Number(item.price) * Number(item.quantity),
      0
    );

    // حالياً لا يوجد خصم مطبق في عملية إنشاء الطلب
    const discountAmount = 0;
    const totalAmount = subtotal - discountAmount;

    const orderResult = await client.query(
      `INSERT INTO orders (
         user_id,
         customer_name,
         customer_phone,
         phone,
         city,
         address,
         subtotal,
         discount_amount,
         total_amount,
         payment_method,
         status
       )
       VALUES ($1, $2, $3, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        userId,
        customerName,
        phone.trim(),
        city.trim(),
        address.trim(),
        subtotal,
        discountAmount,
        totalAmount,
        "cash_on_delivery",
        "pending",
      ]
    );

    const order = orderResult.rows[0];

    for (const item of items) {
      const lineTotal =
        Number(item.price) * Number(item.quantity);

      await client.query(
        `INSERT INTO order_items (
           order_id,
           product_id,
           product_name_en,
           product_name_ar,
           quantity,
           price,
           total
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          order.id,
          item.product_id,
          item.name_en,
          item.name_ar,
          item.quantity,
          item.price,
          lineTotal,
        ]
      );

      await client.query(
        `UPDATE products
         SET stock = stock - $1
         WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }

    await client.query(
      "DELETE FROM cart_items WHERE user_id = $1",
      [userId]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Order rollback error:", rollbackError);
      }
    }

    console.error("Create order error:", error);
    return res.status(500).json({
      message: "Failed to create order",
    });
  } finally {
    if (client) client.release();
  }
};

// استعلام مشترك لجلب تفاصيل الطلب وعناصره
const getOrderQuery = `
  SELECT
    o.id,
    o.user_id,
    o.customer_name,
    COALESCE(NULLIF(o.customer_phone, ''), o.phone, '') AS customer_phone,
    o.city,
    o.address,
    o.subtotal,
    o.discount_amount,
    o.total_amount,
    o.payment_method,
    o.status,
    o.created_at,
    o.updated_at,
    COALESCE(
      json_agg(
        json_build_object(
          'id', oi.id,
          'product_id', oi.product_id,
          'product_name_en', oi.product_name_en,
          'product_name_ar', oi.product_name_ar,
          'quantity', oi.quantity,
          'price', oi.price,
          'total', oi.total,
          'image', (
            SELECT pi.image_url
            FROM product_images pi
            WHERE pi.product_id = oi.product_id
            ORDER BY pi.sort_order ASC, pi.id ASC
            LIMIT 1
          )
        )
        ORDER BY oi.id
      ) FILTER (WHERE oi.id IS NOT NULL),
      '[]'::json
    ) AS items
  FROM orders o
  LEFT JOIN order_items oi ON oi.order_id = o.id
`;

// طلبات المستخدم الحالي
const getMyOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `${getOrderQuery}
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );

    return res.json({ orders: result.rows });
  } catch (error) {
    console.error("Get my orders error:", error);
    return res.status(500).json({
      message: "Failed to fetch orders",
    });
  }
};

// تفاصيل طلب واحد للمستخدم، بشرط أن يكون طلبه
const getOrderById = async (req, res) => {
  try {
    const result = await pool.query(
      `${getOrderQuery}
       WHERE o.id = $1 AND o.user_id = $2
       GROUP BY o.id`,
      [req.params.id, req.user.id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({ order: result.rows[0] });
  } catch (error) {
    console.error("Get order by id error:", error);
    return res.status(500).json({
      message: "Failed to fetch order",
    });
  }
};

// كل الطلبات للأدمن
const getAdminOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `${getOrderQuery}
       GROUP BY o.id
       ORDER BY o.created_at DESC`
    );

    return res.json({ orders: result.rows });
  } catch (error) {
    console.error("Get admin orders error:", error);
    return res.status(500).json({
      message: "Failed to fetch all orders",
    });
  }
};

// تحديث حالة الطلب للأدمن
const updateOrderStatus = async (req, res) => {
  try {
    const orderId = Number(req.params.id);
    const { status } = req.body;

    if (!Number.isInteger(orderId) || orderId < 1) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    if (!ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        message: "Invalid order status",
        allowedStatuses: ORDER_STATUSES,
      });
    }

    const result = await pool.query(
      `UPDATE orders
       SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, status, updated_at`,
      [status, orderId]
    );

    if (!result.rows.length) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({
      message: "Order status updated successfully",
      order: result.rows[0],
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(500).json({
      message: "Failed to update order status",
    });
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAdminOrders,
  updateOrderStatus,
};
