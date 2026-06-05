import express from "express";
import {
  addToCart,
  getCart,
  updateCartQty,
  deleteCartItem,
  clearCart,
} from "../../controllers/admin/cart.controller.js";

import { verifyToken } from "../../middleware/auth.middleware.js";

const router = express.Router();

/* ================================
   CART ROUTES (ORDER IS IMPORTANT)
================================ */

// ADD ITEM TO CART
router.post("/add", verifyToken, addToCart);

// GET USER CART
router.get("/", verifyToken, getCart);

// UPDATE QUANTITY
router.put("/update", verifyToken, updateCartQty);

// CLEAR ENTIRE CART (MUST COME BEFORE /:id)
router.delete("/clear", verifyToken, clearCart);

// DELETE SINGLE ITEM (MUST BE LAST)
router.delete("/:id", verifyToken, deleteCartItem);

export default router;