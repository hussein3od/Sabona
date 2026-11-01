const pool = require("../config/db");
const supabase = require("../config/supabase");

// =========================
// Get all products
// =========================
const getProducts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        p.id,
        p.name_en,
        p.name_ar,
        p.short_description_en,
        p.short_description_ar,
        p.description_en,
        p.description_ar,
        p.ingredients_en,
        p.ingredients_ar,
        p.usage_en,
        p.usage_ar,
        p.benefits_en,
        p.benefits_ar,
        p.warnings_en,
        p.warnings_ar,
        p.price,
        p.stock,
        p.image_url,
        p.created_at,
        p.updated_at,

        COALESCE(
          ARRAY_AGG(DISTINCT put.usage_type)
          FILTER (WHERE put.usage_type IS NOT NULL),
          '{}'
        ) AS usage_types,

        COALESCE(
          ARRAY_AGG(DISTINCT pst.skin_type)
          FILTER (WHERE pst.skin_type IS NOT NULL),
          '{}'
        ) AS skin_types,

        COALESCE(
          JSON_AGG(
            DISTINCT JSONB_BUILD_OBJECT(
              'id', pi.id,
              'image_url', pi.image_url,
              'sort_order', pi.sort_order
            )
          ) FILTER (WHERE pi.id IS NOT NULL),
          '[]'
        ) AS images

      FROM products p

      LEFT JOIN product_usage_types put
        ON p.id = put.product_id

      LEFT JOIN product_skin_types pst
        ON p.id = pst.product_id

      LEFT JOIN product_images pi
        ON p.id = pi.product_id

      GROUP BY p.id
      ORDER BY p.created_at DESC
    `);

    res.json({
      products: result.rows,
    });
  } catch (error) {
    console.error("Get products error:", error);

    res.status(500).json({
      message: "Failed to get products",
    });
  }
};

// =========================
// Get single product
// =========================
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const productResult = await pool.query(
      `
      SELECT
        id,
        name_en,
        name_ar,
        short_description_en,
        short_description_ar,
        description_en,
        description_ar,
        ingredients_en,
        ingredients_ar,
        usage_en,
        usage_ar,
        benefits_en,
        benefits_ar,
        warnings_en,
        warnings_ar,
        price,
        stock,
        image_url,
        created_at,
        updated_at
      FROM products
      WHERE id = $1
      `,
      [id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const usageResult = await pool.query(
      `
      SELECT usage_type
      FROM product_usage_types
      WHERE product_id = $1
      ORDER BY id
      `,
      [id]
    );

    const skinResult = await pool.query(
      `
      SELECT skin_type
      FROM product_skin_types
      WHERE product_id = $1
      ORDER BY id
      `,
      [id]
    );

    const imagesResult = await pool.query(
      `
      SELECT
        id,
        image_url,
        sort_order
      FROM product_images
      WHERE product_id = $1
      ORDER BY sort_order ASC, id ASC
      `,
      [id]
    );

    const product = productResult.rows[0];

    product.usage_types = usageResult.rows.map(
      (item) => item.usage_type
    );

    product.skin_types = skinResult.rows.map(
      (item) => item.skin_type
    );

    product.images = imagesResult.rows;

    res.json({
      product,
    });
  } catch (error) {
    console.error("Get product error:", error);

    res.status(500).json({
      message: "Failed to get product",
    });
  }
};

// =========================
// Create product
// =========================
const createProduct = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      name_en,
      name_ar,
      short_description_en,
      short_description_ar,
      description_en,
      description_ar,
      ingredients_en,
      ingredients_ar,
      usage_en,
      usage_ar,
      benefits_en,
      benefits_ar,
      warnings_en,
      warnings_ar,
      price,
      stock,
      usage_types,
      skin_types,
    } = req.body;

    // -------------------------
    // Validation
    // -------------------------
    if (!name_en || !name_ar) {
      return res.status(400).json({
        message: "Product name in both languages is required",
      });
    }

    if (price === undefined || price === null || Number(price) <= 0) {
      return res.status(400).json({
        message: "A valid price is required",
      });
    }

    if (
      stock === undefined ||
      stock === null ||
      Number(stock) < 0 ||
      !Number.isInteger(Number(stock))
    ) {
      return res.status(400).json({
        message: "A valid stock quantity is required",
      });
    }

    if (!Array.isArray(usage_types) || usage_types.length === 0) {
      return res.status(400).json({
        message: "At least one usage type is required",
      });
    }

    if (!Array.isArray(skin_types) || skin_types.length === 0) {
      return res.status(400).json({
        message: "At least one skin type is required",
      });
    }

    const validUsageTypes = ["face", "body", "hair"];
    const validSkinTypes = [
      "oily",
      "dry",
      "normal",
      "sensitive",
    ];

    const invalidUsageType = usage_types.some(
      (type) => !validUsageTypes.includes(type)
    );

    const invalidSkinType = skin_types.some(
      (type) => !validSkinTypes.includes(type)
    );

    if (invalidUsageType) {
      return res.status(400).json({
        message: "Invalid usage type",
      });
    }

    if (invalidSkinType) {
      return res.status(400).json({
        message: "Invalid skin type",
      });
    }

    await client.query("BEGIN");

    // -------------------------
    // Create product
    // -------------------------
    const productResult = await client.query(
      `
      INSERT INTO products (
        name_en,
        name_ar,
        short_description_en,
        short_description_ar,
        description_en,
        description_ar,
        ingredients_en,
        ingredients_ar,
        usage_en,
        usage_ar,
        benefits_en,
        benefits_ar,
        warnings_en,
        warnings_ar,
        price,
        stock
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        $12,
        $13,
        $14,
        $15,
        $16
      )
      RETURNING
        id,
        name_en,
        name_ar,
        short_description_en,
        short_description_ar,
        description_en,
        description_ar,
        ingredients_en,
        ingredients_ar,
        usage_en,
        usage_ar,
        benefits_en,
        benefits_ar,
        warnings_en,
        warnings_ar,
        price,
        stock,
        image_url,
        created_at,
        updated_at
      `,
      [
        name_en,
        name_ar,
        short_description_en || null,
        short_description_ar || null,
        description_en || null,
        description_ar || null,
        ingredients_en || null,
        ingredients_ar || null,
        usage_en || null,
        usage_ar || null,
        benefits_en || null,
        benefits_ar || null,
        warnings_en || null,
        warnings_ar || null,
        Number(price),
        Number(stock),
      ]
    );

    const product = productResult.rows[0];

    // -------------------------
    // Add usage types
    // -------------------------
    for (const usageType of usage_types) {
      await client.query(
        `
        INSERT INTO product_usage_types (
          product_id,
          usage_type
        )
        VALUES ($1, $2)
        `,
        [product.id, usageType]
      );
    }

    // -------------------------
    // Add skin types
    // -------------------------
    for (const skinType of skin_types) {
      await client.query(
        `
        INSERT INTO product_skin_types (
          product_id,
          skin_type
        )
        VALUES ($1, $2)
        `,
        [product.id, skinType]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Product created successfully",
      product: {
        ...product,
        usage_types,
        skin_types,
        images: [],
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Create product error:", error);

    res.status(500).json({
      message: "Failed to create product",
    });
  } finally {
    client.release();
  }
};

// =========================
// Update product
// =========================
const updateProduct = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    const {
      name_en,
      name_ar,
      short_description_en,
      short_description_ar,
      description_en,
      description_ar,
      ingredients_en,
      ingredients_ar,
      usage_en,
      usage_ar,
      benefits_en,
      benefits_ar,
      warnings_en,
      warnings_ar,
      price,
      stock,
      usage_types,
      skin_types,
    } = req.body;

    if (!name_en || !name_ar) {
      return res.status(400).json({
        message: "Product name in both languages is required",
      });
    }

    if (price === undefined || price === null || Number(price) <= 0) {
      return res.status(400).json({
        message: "A valid price is required",
      });
    }

    if (
      stock === undefined ||
      stock === null ||
      Number(stock) < 0 ||
      !Number.isInteger(Number(stock))
    ) {
      return res.status(400).json({
        message: "A valid stock quantity is required",
      });
    }

    if (!Array.isArray(usage_types) || usage_types.length === 0) {
      return res.status(400).json({
        message: "At least one usage type is required",
      });
    }

    if (!Array.isArray(skin_types) || skin_types.length === 0) {
      return res.status(400).json({
        message: "At least one skin type is required",
      });
    }

    const validUsageTypes = ["face", "body", "hair"];
    const validSkinTypes = [
      "oily",
      "dry",
      "normal",
      "sensitive",
    ];

    if (
      usage_types.some(
        (type) => !validUsageTypes.includes(type)
      )
    ) {
      return res.status(400).json({
        message: "Invalid usage type",
      });
    }

    if (
      skin_types.some(
        (type) => !validSkinTypes.includes(type)
      )
    ) {
      return res.status(400).json({
        message: "Invalid skin type",
      });
    }

    await client.query("BEGIN");

    // -------------------------
    // Update main product
    // -------------------------
    const productResult = await client.query(
      `
      UPDATE products
      SET
        name_en = $1,
        name_ar = $2,
        short_description_en = $3,
        short_description_ar = $4,
        description_en = $5,
        description_ar = $6,
        ingredients_en = $7,
        ingredients_ar = $8,
        usage_en = $9,
        usage_ar = $10,
        benefits_en = $11,
        benefits_ar = $12,
        warnings_en = $13,
        warnings_ar = $14,
        price = $15,
        stock = $16,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $17
      RETURNING
        id,
        name_en,
        name_ar,
        short_description_en,
        short_description_ar,
        description_en,
        description_ar,
        ingredients_en,
        ingredients_ar,
        usage_en,
        usage_ar,
        benefits_en,
        benefits_ar,
        warnings_en,
        warnings_ar,
        price,
        stock,
        image_url,
        created_at,
        updated_at
      `,
      [
        name_en,
        name_ar,
        short_description_en || null,
        short_description_ar || null,
        description_en || null,
        description_ar || null,
        ingredients_en || null,
        ingredients_ar || null,
        usage_en || null,
        usage_ar || null,
        benefits_en || null,
        benefits_ar || null,
        warnings_en || null,
        warnings_ar || null,
        Number(price),
        Number(stock),
        id,
      ]
    );

    if (productResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Product not found",
      });
    }

    // -------------------------
    // Replace usage types
    // -------------------------
    await client.query(
      `
      DELETE FROM product_usage_types
      WHERE product_id = $1
      `,
      [id]
    );

    for (const usageType of usage_types) {
      await client.query(
        `
        INSERT INTO product_usage_types (
          product_id,
          usage_type
        )
        VALUES ($1, $2)
        `,
        [id, usageType]
      );
    }

    // -------------------------
    // Replace skin types
    // -------------------------
    await client.query(
      `
      DELETE FROM product_skin_types
      WHERE product_id = $1
      `,
      [id]
    );

    for (const skinType of skin_types) {
      await client.query(
        `
        INSERT INTO product_skin_types (
          product_id,
          skin_type
        )
        VALUES ($1, $2)
        `,
        [id, skinType]
      );
    }

    await client.query("COMMIT");

    res.json({
      message: "Product updated successfully",
      product: {
        ...productResult.rows[0],
        usage_types,
        skin_types,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Update product error:", error);

    res.status(500).json({
      message: "Failed to update product",
    });
  } finally {
    client.release();
  }
};

// =========================
// Delete product
// =========================
const deleteProduct = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    await client.query("BEGIN");

    const result = await client.query(
      `
      DELETE FROM products
      WHERE id = $1
      RETURNING id
      `,
      [id]
    );

    if (result.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Product not found",
      });
    }

    await client.query("COMMIT");

    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Delete product error:", error);

    res.status(500).json({
      message: "Failed to delete product",
    });
  } finally {
    client.release();
  }
};
// =========================
// Add product images
// =========================
const addProductImages = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const { images } = req.body;

    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        message: "At least one image is required",
      });
    }

    const productResult = await client.query(
      `SELECT id FROM products WHERE id = $1`,
      [id]
    );

    if (productResult.rows.length === 0) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    await client.query("BEGIN");

    for (let i = 0; i < images.length; i++) {
      const imageUrl = images[i];

      if (!imageUrl || typeof imageUrl !== "string") {
        continue;
      }

      await client.query(
        `
        INSERT INTO product_images (
          product_id,
          image_url,
          sort_order
        )
        VALUES ($1, $2, $3)
        `,
        [id, imageUrl, i]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Product images added successfully",
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Add product images error:", error);

    res.status(500).json({
      message: "Failed to add product images",
    });
  } finally {
    client.release();
  }
};
const deleteProductImage = async (req, res) => {
  try {
    const { id: productId, imageId } = req.params;

    const imageQuery = await pool.query(
      "SELECT * FROM product_images WHERE id = $1 AND product_id = $2",
      [imageId, productId]
    );

    if (imageQuery.rows.length === 0) {
      return res.status(404).json({ message: "Image not found in database" });
    }

    const imageUrl = imageQuery.rows[0].image_url;

    const fileParts = imageUrl.split("/");
    const fileName = fileParts[fileParts.length - 1]; 
    const { error: storageError } = await supabase.storage
      .from("sabona-images")
      .remove([fileName]);

    if (storageError) {
      console.error("Supabase Storage Error:", storageError);
    }

    await pool.query(
      "DELETE FROM product_images WHERE id = $1 AND product_id = $2",
      [imageId, productId]
    );

    return res.status(200).json({
      message: "Image deleted successfully from Supabase and Neon",
    });
  } catch (error) {
    console.error("Server Error in deleteProductImage:", error);
    return res.status(500).json({
      message: "Server error while deleting image",
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductImages,
  deleteProductImage,
};