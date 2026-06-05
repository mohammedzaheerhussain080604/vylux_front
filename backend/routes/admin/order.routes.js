import express from "express";
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from "../../controllers/admin/order.controller.js";

import { verifyToken, isAdmin } from "../../middleware/auth.middleware.js";

const router = express.Router();

/* =========================================================
   ADMIN ROUTES (PUT THESE FIRST - VERY IMPORTANT)
========================================================= */

// Get ALL orders (admin only)
router.get("/admin/all", verifyToken, isAdmin, getAllOrders);

// Get SINGLE order (admin only)
router.get("/admin/:id", verifyToken, isAdmin, getOrderById);

// UPDATE order status (admin only)
router.put("/admin/:id/status", verifyToken, isAdmin, updateOrderStatus);

// DELETE order (admin only)
router.delete("/admin/:id", verifyToken, isAdmin, deleteOrder);


/* =========================================================
   USER ROUTES
========================================================= */

// Create order (user/wholesaler)
router.post("/", verifyToken, createOrder);

// Get logged-in user orders
router.get("/my-orders", verifyToken, getMyOrders);

// Get single order (user view)
router.get("/:id", verifyToken, getOrderById);


export default router;