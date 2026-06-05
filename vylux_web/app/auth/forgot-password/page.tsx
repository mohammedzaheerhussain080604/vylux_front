"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./forgotpassword.module.css";
import { FiMail, FiLock } from "react-icons/fi";

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);

  // =========================
  // STEP 1 → SEND OTP
  // =========================
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/vylux/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to send OTP");
        return;
      }

      alert("OTP sent successfully to email");
      setStep(2);

    } catch (error) {
      console.log(error);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // STEP 2 → VERIFY OTP
  // =========================
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/vylux/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          otp,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Invalid OTP");
        return;
      }

      alert("OTP verified successfully");
      setStep(3);

    } catch (error) {
      console.log(error);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // STEP 3 → RESET PASSWORD
  // =========================
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      alert("Password must be at least 8 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/vylux/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Password reset failed");
        return;
      }

      alert("Password changed successfully");

      // go to login page
      router.push("/auth/login");

    } catch (error) {
      console.log(error);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Forgot Password</h1>

      <p className={styles.subtitle}>
        {step === 1 && "Enter your email to receive OTP"}
        {step === 2 && "Enter OTP sent to your email"}
        {step === 3 && "Create a new password"}
      </p>

      {/* STEP 1 */}
      {step === 1 && (
        <form className={styles.form} onSubmit={handleSendOtp}>
          <div className={styles.inputGroup}>
            <FiMail className={styles.icon} />
            <input
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={50}
              className={styles.input}
            />
          </div>

          <button className={styles.button} disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <form className={styles.form} onSubmit={handleVerifyOtp}>
          <div className={styles.inputGroup}>
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              maxLength={6}
              className={styles.input}
            />
          </div>

          <button className={styles.button} disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <form className={styles.form} onSubmit={handleResetPassword}>
          <div className={styles.inputGroup}>
            <FiLock className={styles.icon} />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              maxLength={16}
              className={styles.input}
            />
          </div>

          <div className={styles.inputGroup}>
            <FiLock className={styles.icon} />
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              maxLength={16}
              className={styles.input}
            />
          </div>

          <button className={styles.button} disabled={loading}>
            {loading ? "Updating..." : "Change Password"}
          </button>
        </form>
      )}
    </main>
  );
}