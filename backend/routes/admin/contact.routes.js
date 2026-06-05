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

const router = express.Router();

/*
=========================================
CONTACT SETTINGS
=========================================
*/

// GET settings
router.get("/settings", getContactSettings);

// CREATE / UPDATE settings (with image upload)
router.post(
  "/settings",
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

// admin list
router.get("/callback", getCallbackRequests);

// update status
router.put("/callback/:id", updateCallbackStatus);

// delete request
router.delete("/callback/:id", deleteCallbackRequest);

export default router;