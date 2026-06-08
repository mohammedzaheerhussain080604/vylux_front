import express from "express";

import {
  getContactSettings,
  saveContactSettings,
  createCallbackRequest,
  getCallbackRequests,
  updateCallbackStatus,
  deleteCallbackRequest,
} from "../../controllers/admin/contact.controller.js";

import upload from "../../middleware/upload.js";

import {
  verifyToken,
  isAdmin,
} from "../../middleware/auth.middleware.js";

const router = express.Router();

/*
=========================================
CONTACT SETTINGS
=========================================
*/

// GET settings (public)
router.get("/settings", getContactSettings);

// CREATE / UPDATE settings (ADMIN ONLY)
router.post(
  "/settings",
  verifyToken,
  isAdmin,
  upload.single("banner"),
  saveContactSettings
);

/*
=========================================
CALLBACK REQUESTS
=========================================
*/

// create request (public)
router.post("/callback", createCallbackRequest);

// admin list (ADMIN ONLY)
router.get(
  "/callback",
  verifyToken,
  isAdmin,
  getCallbackRequests
);

// update status (ADMIN ONLY)
router.put(
  "/callback/:id",
  verifyToken,
  isAdmin,
  updateCallbackStatus
);

// delete request (ADMIN ONLY)
router.delete(
  "/callback/:id",
  verifyToken,
  isAdmin,
  deleteCallbackRequest
);

export default router;