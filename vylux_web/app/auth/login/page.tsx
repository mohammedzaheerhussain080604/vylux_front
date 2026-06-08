"use client";

import { useState, FormEvent } from "react";
import Image from "next/image";
import styles from "./login.module.css";
import { useRouter } from "next/navigation";

import {
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

import logo from "../../../public/logo/brand_logo.jpeg";

export default function LoginPage() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  // backend states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setLoading(true);

      const res = await fetch("https://vylux-front.onrender.com/api/vylux/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Login failed");
        return;
      }

      // save JWT token
      

      localStorage.setItem("token", data.token);
localStorage.setItem("user", JSON.stringify(data.user));

alert("Login Successful");

// 👇 THIS IS THE FIX
if (data.user.role === "admin") {
  router.push("/admin/homepage");
} else {
  router.push("/users/homepage");
}

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
          alt="Brand Logo"
          className={styles.logo}
          priority
        />
      </div>

      <h1 className={styles.title}>Welcome Back</h1>

      <p className={styles.subtitle}>
        Login to continue your journey with us
      </p>

      <form className={styles.form} onSubmit={handleSubmit}>
        {/* EMAIL */}
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

        {/* PASSWORD */}
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

        {/* FORGOT PASSWORD */}
        <div className={styles.forgotWrapper}>
          <button
            type="button"
            className={styles.forgotPassword}
            onClick={() => router.push("/auth/forgot-password")}
          >
            Forgot Password?
          </button>
        </div>

        {/* LOGIN BUTTON */}
        <button
          type="submit"
          className={styles.loginButton}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      {/* FOOTER */}
      <div className={styles.footer}>
        <span>Don't have an account?</span>

        <button
          type="button"
          className={styles.registerLink}
          onClick={() => router.push("/auth/register")}
        >
          Register
        </button>
      </div>
    </main>
  );
}