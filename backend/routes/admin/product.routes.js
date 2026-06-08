import express from "express";

import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getNewArrivals,
} from "../../controllers/admin/product.controller.js";

import {
  verifyToken,
  isAdmin,
} from "../../middleware/auth.middleware.js";

import upload from "../../middleware/upload.js";

const router = express.Router();

/* ================= CREATE (ADMIN ONLY) ================= */
router.post(
  "/",
  verifyToken,
  isAdmin,
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
  ]),
  createProduct
);

/* ================= NEW ARRIVALS (PUBLIC) ================= */
router.get("/new-arrivals", getNewArrivals);

/* ================= ALL PRODUCTS (PUBLIC) ================= */
router.get("/", getAllProducts);

/* ================= SINGLE PRODUCT (PUBLIC) ================= */
router.get("/:id", getProductById);

/* ================= UPDATE (ADMIN ONLY) ================= */
router.put(
  "/:id",
  verifyToken,
  isAdmin,
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
  ]),
  updateProduct
);

/* ================= DELETE (ADMIN ONLY) ================= */
router.delete(
  "/:id",
  verifyToken,
  isAdmin,
  deleteProduct
);

export default router;