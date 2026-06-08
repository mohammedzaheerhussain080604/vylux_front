import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import "./db/init.js";

import authRoutes from "./routes/auth.routes.js";
import homeRoutes from "./routes/admin/home.routes.js";
import contactRoutes from "./routes/admin/contact.routes.js";
import productRoutes from "./routes/admin/product.routes.js";
import cartRoutes from "./routes/admin/cart.routes.js";
import orderRoutes from "./routes/admin/order.routes.js";
import profileRoutes from "./routes/admin/profile.routes.js";
import dashboardRoutes from "./routes/admin/dashboard.routes.js";

dotenv.config();

const app = express();

/* ================= CORS ================= */
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "*",
    credentials: true,
  })
);

/* ================= MIDDLEWARE ================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* ================= ROUTES ================= */

app.use("/api/vylux/auth", authRoutes);

app.use("/api/vylux/home", homeRoutes);

app.use("/api/vylux/profile", profileRoutes);

app.use("/api/vylux/contact", contactRoutes);

app.use("/api/vylux/products", productRoutes);

app.use("/api/vylux/cart", cartRoutes);

app.use("/api/vylux/orders", orderRoutes);

app.use("/api/vylux/dashboard", dashboardRoutes);

/* ================= HEALTH CHECK ================= */

app.get("/", (req, res) => {
  res.json({
    message: "Vylux Backend is running 🚀",
    status: "OK",
  });
});

/* ================= 404 HANDLER ================= */

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

/* ================= ERROR HANDLER ================= */

app.use((err, req, res, next) => {
  console.error("Server Error:", err);

  res.status(500).json({
    message: "Internal Server Error",
  });
});

/* ================= START SERVER ================= */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});