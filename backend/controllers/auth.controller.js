import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../db/db.js";
import { sendOtpEmail } from "../utils/sendOtpEmail.js";

// ======================================
// REGISTER (WHOLESALER ONLY SYSTEM)
// ======================================
export const register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const cleanEmail = email.toLowerCase().trim();

    const exists = await db.query(
      "SELECT * FROM users WHERE email=$1",
      [cleanEmail]
    );

    if (exists.rows.length > 0) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      `INSERT INTO users (name, email, phone, password, role)
       VALUES ($1, $2, $3, $4, 'wholesaler')`,
      [name, cleanEmail, phone, hashedPassword]
    );

    return res.status(201).json({
      message: "Wholesaler registered successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

// ======================================
// LOGIN (JWT AUTH)
// ======================================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const cleanEmail = email.toLowerCase().trim();

    const user = await db.query(
      "SELECT * FROM users WHERE email=$1",
      [cleanEmail]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isValid = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!isValid) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    const token = jwt.sign(
      {
        id: user.rows[0].id,
        role: user.rows[0].role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      message: "Login successful",
      token,
      user: {
        id: user.rows[0].id,
        name: user.rows[0].name,
        email: user.rows[0].email,
        role: user.rows[0].role,
      },
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

// ======================================
// FORGOT PASSWORD (SEND OTP EMAIL)
// ======================================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const cleanEmail = email.toLowerCase().trim();

    const user = await db.query(
      "SELECT * FROM users WHERE email=$1",
      [cleanEmail]
    );

    if (user.rows.length === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    await db.query(
      `UPDATE users
       SET otp=$1,
           otp_expiry=NOW() + INTERVAL '10 minutes'
       WHERE email=$2`,
      [otp, cleanEmail]
    );

    await sendOtpEmail(cleanEmail, otp);

    return res.json({
      message: "OTP sent successfully to email",
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

// ======================================
// VERIFY OTP
// ======================================
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const cleanEmail = email.toLowerCase().trim();

    const result = await db.query(
      `
      SELECT *
      FROM users
      WHERE email = $1
      AND otp = $2
      AND otp_expiry > NOW()a
      `,
      [cleanEmail, otp]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({
        message: "Invalid or expired OTP",
      });
    }

    return res.json({
      message: "OTP verified successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};

// ======================================
// RESET PASSWORD
// ======================================
export const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const cleanEmail = email.toLowerCase().trim();

    const hashedPassword = await bcrypt.hash(
      newPassword,
      10
    );

    await db.query(
      `UPDATE users
       SET password=$1,
           otp=NULL,
           otp_expiry=NULL
       WHERE email=$2`,
      [hashedPassword, cleanEmail]
    );

    return res.json({
      message: "Password updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      error: err.message,
    });
  }
};