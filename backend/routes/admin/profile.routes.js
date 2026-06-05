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

import { verifyToken, isAdmin } from "../../middleware/auth.middleware.js";

const router = express.Router();

/* USER */
router.get("/", verifyToken, getProfile);
router.put("/", verifyToken, updateProfile);

/* ADMIN */
router.get("/all", verifyToken, isAdmin, getAllUsers);
router.get("/search", verifyToken, isAdmin, searchUsers);
router.get("/:id", verifyToken, isAdmin, getUserById);

router.delete("/:id", verifyToken, isAdmin, deleteUser);
router.delete("/", verifyToken, isAdmin, deleteAllUsers);

export default router;