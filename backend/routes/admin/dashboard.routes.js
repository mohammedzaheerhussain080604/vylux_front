import express from "express";
import { verifyToken, isAdmin } from "../../middleware/auth.middleware.js";
import { getDashboardStats } from "../../controllers/admin/dashboard.controller.js";

const router = express.Router();

router.get(
  "/stats",
  verifyToken,
  isAdmin,
  getDashboardStats
);

export default router;