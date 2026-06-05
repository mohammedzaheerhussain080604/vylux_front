import { db } from "../../db/db.js";
import { uploadToCloudinary } from "../../utils/cloudinaryUpload.js";

/*
=========================================
GET CONTACT SETTINGS
=========================================
*/
export const getContactSettings = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM contact_settings LIMIT 1`
    );

    res.status(200).json({
      success: true,
      data: result.rows[0] || null,
    });
  } catch (error) {
    console.error("Get Contact Settings Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=========================================
CREATE / UPDATE CONTACT SETTINGS
(FIXED: CLOUDINARY + NO NULL OVERWRITE)
=========================================
*/
export const saveContactSettings = async (req, res) => {
  try {
    const {
      phone_number,
      whatsapp_number,
      email,
      address,
      map_url,
      working_days,
      opening_time,
      closing_time,
      gst_number  
    } = req.body;

    let banner_image = null;

    // ✅ FIX: proper Cloudinary upload from memory buffer
    if (req.file?.buffer) {
      const uploadResult = await uploadToCloudinary(
        req.file.buffer,
        "contact"
      );

      banner_image = uploadResult.secure_url;
    }

    const existing = await db.query(
      `SELECT * FROM contact_settings LIMIT 1`
    );

    /*
    =========================================
    UPDATE EXISTING ROW
    =========================================
    */
    if (existing.rows.length > 0) {
      const current = existing.rows[0];

      const result = await db.query(
        `
        UPDATE contact_settings
        SET
          banner_image = COALESCE($1, banner_image),
          phone_number = COALESCE($2, phone_number),
          whatsapp_number = COALESCE($3, whatsapp_number),
          email = COALESCE($4, email),
          address = COALESCE($5, address),
          map_url = COALESCE($6, map_url),
          working_days = COALESCE($7, working_days),
          opening_time = COALESCE($8, opening_time),
          closing_time = COALESCE($9, closing_time),
          gst_number = COALESCE($10, gst_number)
        WHERE id = $11
        RETURNING *
        `,
        [
          banner_image,
          phone_number,
          whatsapp_number,
          email,
          address,
          map_url,
          working_days,
          opening_time,
          closing_time,
          gst_number,  
          current.id,
        ]
      );

      return res.status(200).json({
        success: true,
        message: "Contact settings updated successfully",
        data: result.rows[0],
      });
    }

    /*
    =========================================
    INSERT FIRST ROW
    =========================================
    */
    const result = await db.query(
      `
      INSERT INTO contact_settings
      (
        banner_image,
        phone_number,
        whatsapp_number,
        email,
        address,
        map_url,
        working_days,
        opening_time,
        closing_time,
        gst_number
      )
      VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *
      `,
      [
        banner_image,
        phone_number || null,
        whatsapp_number || null,
        email || null,
        address || null,
        map_url || null,
        working_days || null,
        opening_time || null,
        closing_time || null,
         gst_number || null 
      ]
    );

    return res.status(201).json({
      success: true,
      message: "Contact settings created successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Save Contact Settings Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=========================================
CREATE CALLBACK REQUEST
=========================================
*/
export const createCallbackRequest = async (req, res) => {
  try {
    const { name, company, phone, requirement } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required",
      });
    }

    const result = await db.query(
      `
      INSERT INTO callback_requests
      (
        name,
        company,
        phone,
        requirement
      )
      VALUES
      ($1,$2,$3,$4)
      RETURNING *
      `,
      [name, company, phone, requirement]
    );

    res.status(201).json({
      success: true,
      message: "Callback request submitted",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Create Callback Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=========================================
GET CALLBACK REQUESTS
=========================================
*/
export const getCallbackRequests = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT *
      FROM callback_requests
      ORDER BY created_at DESC
    `);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error("Get Callback Requests Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=========================================
UPDATE CALLBACK STATUS
=========================================
*/
export const updateCallbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const result = await db.query(
      `
      UPDATE callback_requests
      SET status = $1
      WHERE id = $2
      RETURNING *
      `,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Update Status Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/*
=========================================
DELETE CALLBACK REQUEST
=========================================
*/
export const deleteCallbackRequest = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      `
      DELETE FROM callback_requests
      WHERE id = $1
      `,
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Callback request deleted",
    });
  } catch (error) {
    console.error("Delete Callback Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};