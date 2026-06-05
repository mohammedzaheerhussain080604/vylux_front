import express from "express";
import upload from "../../middleware/upload.js";
import homeController from "../../controllers/admin/home.controller.js";

const router = express.Router();

/* =======================
   BANNERS
======================= */

// Create banner
router.post("/banner", upload.single("image"), homeController.createBanner);

// Get banners
router.get("/banners", homeController.getBanners);

// Delete banner
router.delete("/banner/:id", homeController.deleteBanner);


/* =======================
   CATEGORIES
======================= */

// Create category
router.post("/category", upload.single("image"), homeController.createCategory);

// Get categories
router.get("/categories", homeController.getCategories);

// Delete category
router.delete("/category/:id", homeController.deleteCategory);


export default router;