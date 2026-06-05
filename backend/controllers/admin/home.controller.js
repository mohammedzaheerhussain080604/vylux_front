import { db } from "../../db/db.js";
import cloudinary from "../../config/cloudinary.js";
import streamifier from "streamifier";

/* =========================
   CLOUDINARY UPLOAD FIXED
========================= */
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    if (!fileBuffer) {
      return reject(new Error("Empty file buffer received"));
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

/* =========================
   CREATE BANNER
========================= */
export const createBanner = async (req, res) => {
  try {
    const { name, link } = req.body;

    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    let imageUrl = "";

    if (!req.file) {
      // safe fallback instead of crashing
      imageUrl = "";
    } else {
      const result = await uploadToCloudinary(req.file.buffer, "banners");
      imageUrl = result.secure_url;
    }

    const data = await db.query(
      `INSERT INTO banners (name, link, image)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, link, imageUrl]
    );

    res.status(201).json(data.rows[0]);
  } catch (err) {
    console.error("CREATE BANNER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   GET BANNERS
========================= */
export const getBanners = async (req, res) => {
  try {
    const data = await db.query(
      `SELECT * FROM banners ORDER BY id DESC`
    );

    res.json(data.rows);
  } catch (err) {
    console.error("GET BANNERS ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   DELETE BANNER
========================= */
export const deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(`DELETE FROM banners WHERE id = $1`, [id]);

    res.json({ message: "Banner deleted successfully" });
  } catch (err) {
    console.error("DELETE BANNER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   CREATE CATEGORY
========================= */
export const createCategory = async (req, res) => {
  try {
    const { name, link } = req.body;

    console.log("CATEGORY BODY:", req.body);
    console.log("CATEGORY FILE:", req.file);

    let imageUrl = "";

    if (!req.file) {
      imageUrl = "";
    } else {
      const result = await uploadToCloudinary(req.file.buffer, "categories");
      imageUrl = result.secure_url;
    }

    const data = await db.query(
      `INSERT INTO categories (name, link, image)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, link, imageUrl]
    );

    res.status(201).json(data.rows[0]);
  } catch (err) {
    console.error("CREATE CATEGORY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   GET CATEGORIES
========================= */
export const getCategories = async (req, res) => {
  try {
    const data = await db.query(
      `SELECT * FROM categories ORDER BY id DESC`
    );

    res.json(data.rows);
  } catch (err) {
    console.error("GET CATEGORIES ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   DELETE CATEGORY
========================= */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(`DELETE FROM categories WHERE id = $1`, [id]);

    res.json({ message: "Category deleted successfully" });
  } catch (err) {
    console.error("DELETE CATEGORY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

/* =========================
   EXPORT DEFAULT
========================= */
export default {
  createBanner,
  getBanners,
  deleteBanner,
  createCategory,
  getCategories,
  deleteCategory,
};