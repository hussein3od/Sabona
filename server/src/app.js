const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.disable("x-powered-by");

const allowedOrigins = (
  process.env.CLIENT_ORIGINS ||
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:5173")
)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (
  process.env.NODE_ENV === "production" &&
  (!allowedOrigins.length || (process.env.JWT_SECRET || "").length < 32)
) {
  throw new Error(
    "Production requires CLIENT_ORIGINS and a JWT_SECRET of at least 32 characters"
  );
}

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Origin is not allowed by CORS"));
    },
  })
);
app.use(express.json({ limit: "1mb" }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Soap Store API is running",
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === "entity.too.large") {
    return res.status(413).json({
      message: "Request body is too large",
    });
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({
      message: "Request body contains invalid JSON",
    });
  }

  if (error.message === "Origin is not allowed by CORS") {
    return res.status(403).json({
      message: "Origin is not allowed",
    });
  }

  console.error("Unhandled API error:", error);
  return res.status(500).json({
    message: "Internal server error",
  });
});

module.exports = app;