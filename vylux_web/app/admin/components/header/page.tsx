"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./adminheader.module.css";

import logo from "../../../../public/logo/brand_logo.jpeg";

import { Bell, UserCircle } from "lucide-react";

export default function AdminHeader() {
  return (
    <header className={styles.header}>
      {/* Left Section */}
      <div className={styles.left}>
        <Image
          src={logo}
          alt="VYLUX Logo"
          width={120}
          height={45}
          priority
          className={styles.logo}
        />

        <div className={styles.divider} />

        <div className={styles.titleBlock}>
          <h2>Admin Panel</h2>
          <span>VYLUX Dealer Portal</span>
        </div>
      </div>

      {/* Right Section */}
      <div className={styles.right}>
        <button className={styles.iconBtn}>
          <Bell size={20} />
        </button>

        <Link
          href="/auth/login" target="__blank"
          className={styles.profileBtn}
        >
          <UserCircle size={24} />
          <span>Profile</span>
        </Link>
      </div>
    </header>
  );
}