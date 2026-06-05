"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import styles from "./register.module.css";
import { useRouter } from "next/navigation";

import {
  FiUser,
  FiPhone,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

import logo from "../../../public/logo/brand_logo.jpeg";

export default function RegisterPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // NEW STATES (backend connection)
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("https://vylux-front.onrender.com/api/vylux/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Registration failed");
        return;
      }

      alert("Registration Successful");
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
      <div className={styles.logoWrapper}>
        <Image
          src={logo}
          alt="VYLUX Lighting"
          className={styles.logo}
          priority
        />
      </div>

      <h1 className={styles.title}>Create Your Account</h1>

      <p className={styles.subtitle}>
        Join VYLUX Lighting and start your journey with us
      </p>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Name */}
        <div className={styles.inputGroup}>
          <FiUser className={styles.icon} />

          <input
            type="text"
            placeholder="Full Name"
            className={styles.input}
            required
            minLength={2}
            maxLength={20}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        {/* Mobile */}
        <div className={styles.inputGroup}>
          <FiPhone className={styles.icon} />

          <input
            type="tel"
            placeholder="Mobile Number"
            className={styles.input}
            required
            maxLength={10}
            pattern="[6-9]{1}[0-9]{9}"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {/* Email */}
        <div className={styles.inputGroup}>
          <FiMail className={styles.icon} />

          <input
            type="email"
            placeholder="Email Address"
            className={styles.input}
            required
            maxLength={50}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className={styles.inputGroup}>
          <FiLock className={styles.icon} />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className={styles.input}
            required
            minLength={8}
            maxLength={16}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="button"
            className={styles.eyeButton}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <FiEye /> : <FiEyeOff />}
          </button>
        </div>

        {/* Confirm Password */}
        <div className={styles.inputGroup}>
          <FiLock className={styles.icon} />

          <input
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm Password"
            className={styles.input}
            required
            minLength={8}
            maxLength={16}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button
            type="button"
            className={styles.eyeButton}
            onClick={() =>
              setShowConfirmPassword(!showConfirmPassword)
            }
          >
            {showConfirmPassword ? <FiEye /> : <FiEyeOff />}
          </button>
        </div>

        {/* Password Match Error */}
        {confirmPassword && password !== confirmPassword && (
          <p
            style={{
              color: "red",
              fontSize: "14px",
              marginTop: "-10px",
              marginBottom: "15px",
            }}
          >
            Passwords do not match
          </p>
        )}

        <button
          type="submit"
          className={styles.registerBtn}
          disabled={loading}
        >
          {loading ? "Registering..." : "Register"}
        </button>
      </form>

      <div className={styles.footer}>
        <span>Already have an account?</span>

        <button
          type="button"
          className={styles.loginBtn}
          onClick={() => router.push("/auth/login")}
        >
          Login
        </button>
      </div>
    </main>
  );
}