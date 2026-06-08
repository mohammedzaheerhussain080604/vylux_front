import express from "express";
import upload from "../../middleware/upload.js";
import homeController from "../../controllers/admin/home.controller.js";

import {
  verifyToken,
  isAdmin,
} from "../../middleware/auth.middleware.js";

const router = express.Router();

/* =======================
   BANNERS
======================= */

// Create banner (ADMIN ONLY)
router.post(
  "/banner",
  verifyToken,
  isAdmin,
  upload.single("image"),
  homeController.createBanner
);

// Get banners (PUBLIC or ADMIN - your choice, keeping same)
router.get("/banners", homeController.getBanners);

// Delete banner (ADMIN ONLY)
router.delete(
  "/banner/:id",
  verifyToken,
  isAdmin,
  homeController.deleteBanner
);

/* =======================
   CATEGORIES
======================= */

// Create category (ADMIN ONLY)
router.post(
  "/category",
  verifyToken,
  isAdmin,
  upload.single("image"),
  homeController.createCategory
);

// Get categories (PUBLIC or ADMIN - unchanged)
router.get("/categories", homeController.getCategories);

// Delete category (ADMIN ONLY)
router.delete(
  "/category/:id",
  verifyToken,
  isAdmin,
  homeController.deleteCategory
);

export default router;