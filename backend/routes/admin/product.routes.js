import express from "express";

import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getNewArrivals,
} from "../../controllers/admin/product.controller.js";

import upload from "../../middleware/upload.js";

const router = express.Router();

/* ================= CREATE ================= */
router.post(
  "/",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
  ]),
  createProduct
);

/* ================= NEW ARRIVALS (IMPORTANT FIRST) ================= */
router.get("/new-arrivals", getNewArrivals);

/* ================= ALL PRODUCTS ================= */
router.get("/", getAllProducts);

/* ================= SINGLE PRODUCT ================= */
router.get("/:id", getProductById);

/* ================= UPDATE ================= */
router.put(
  "/:id",
  upload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 10 },
  ]),
  updateProduct
);

/* ================= DELETE ================= */
router.delete("/:id", deleteProduct);

export default router;