import { db } from "../../db/db.js";

/* =========================================================
   GET LOGGED IN USER PROFILE
========================================================= */
export const getProfile = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - missing user",
      });
    }

    const result = await db.query(
      `SELECT
        id,
        name,
        email,
        phone,
        alternate_phone,
        shop_name,
        gstin,
        address,
        pincode,
        role,
        created_at,
        updated_at
      FROM users
      WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user: result.rows[0],
    });

  } catch (err) {
    console.error("GET PROFILE ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


/* =========================================================
   UPDATE LOGGED IN USER PROFILE (SAFE PARTIAL UPDATE)
========================================================= */
export const updateProfile = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - missing user",
      });
    }

    const {
      alternatePhone,
      shopName,
      gstin,
      address,
      pincode,
    } = req.body;

    // Optional validation example
    if (pincode && pincode.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "Invalid pincode",
      });
    }

    const result = await db.query(
      `UPDATE users
       SET
         alternate_phone = COALESCE($1, alternate_phone),
         shop_name = COALESCE($2, shop_name),
         gstin = COALESCE($3, gstin),
         address = COALESCE($4, address),
         pincode = COALESCE($5, pincode),
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING
         id,
         name,
         email,
         phone,
         alternate_phone,
         shop_name,
         gstin,
         address,
         pincode,
         role`,
      [
        alternatePhone || null,
        shopName || null,
        gstin || null,
        address || null,
        pincode || null,
        req.user.id,
      ]
    );

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user: result.rows[0],
    });

  } catch (err) {
    console.error("UPDATE PROFILE ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


/* =========================================================
   GET ALL USERS (ADMIN)
========================================================= */
export const getAllUsers = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        id,
        name,
        email,
        phone,
        alternate_phone,
        shop_name,
        gstin,
        address,
        pincode,
        role,
        created_at,
        updated_at
      FROM users
      ORDER BY id DESC
    `);

    return res.json({
      success: true,
      count: result.rows.length,
      users: result.rows,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


/* =========================================================
   GET USER BY ID (ADMIN)
========================================================= */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT
        id,
        name,
        email,
        phone,
        alternate_phone,
        shop_name,
        gstin,
        address,
        pincode,
        role
      FROM users
      WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user: result.rows[0],
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


/* =========================================================
   SEARCH USERS (ADMIN)
========================================================= */
export const searchUsers = async (req, res) => {
  try {
    const { keyword = "" } = req.query;

    const result = await db.query(
      `SELECT
        id,
        name,
        email,
        phone,
        shop_name,
        role
      FROM users
      WHERE
        name ILIKE $1
        OR email ILIKE $1
        OR phone ILIKE $1
        OR shop_name ILIKE $1
      ORDER BY id DESC`,
      [`%${keyword}%`]
    );

    return res.json({
      success: true,
      count: result.rows.length,
      users: result.rows,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


/* =========================================================
   DELETE SINGLE USER (ADMIN)
========================================================= */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `DELETE FROM users
       WHERE id = $1
       RETURNING id, name, email`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      message: "User deleted successfully",
      user: result.rows[0],
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


/* =========================================================
   DELETE ALL USERS (ADMIN - DANGEROUS)
========================================================= */
export const deleteAllUsers = async (req, res) => {
  try {
    await db.query(`DELETE FROM users`);

    return res.json({
      success: true,
      message: "All users deleted successfully",
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};