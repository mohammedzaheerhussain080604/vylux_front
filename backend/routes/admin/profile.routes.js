import express from "express";
import {
  getProfile,
  updateProfile,
  getAllUsers,
  getUserById,
  searchUsers,
  deleteUser,
  deleteAllUsers,
} from "../../controllers/admin/profile.controller.js";

import {
  verifyToken,
  isAdmin,
} from "../../middleware/auth.middleware.js";

const router = express.Router();

/* =========================
   USER PROFILE (SELF)
========================= */

// Get logged-in user profile
router.get("/", verifyToken, getProfile);

// Update logged-in user profile
router.put("/", verifyToken, updateProfile);

/* =========================
   ADMIN ROUTES
========================= */

// Get all users
router.get("/all", verifyToken, isAdmin, getAllUsers);

// Search users
router.get("/search", verifyToken, isAdmin, searchUsers);

// Get single user by ID
router.get("/:id", verifyToken, isAdmin, getUserById);

// Delete single user
router.delete("/:id", verifyToken, isAdmin, deleteUser);

// Delete all users (DANGEROUS - admin only)
router.delete("/", verifyToken, isAdmin, deleteAllUsers);

export default router;