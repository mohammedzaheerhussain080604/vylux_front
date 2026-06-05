"use client";

import Link from "next/link";
import styles from "./footer.module.css";
import {
  Home,
  ShoppingBag,
  ClipboardList,
  FileText,
  User,
  Phone,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* HOME */}
      <Link href="/users/homepage" className={styles.navItem}>
        <Home size={22} />
        <span>Home</span>
      </Link>

      {/* PRODUCTS */}
      <Link href="/users/productpage" className={styles.navItem}>
        <ShoppingBag size={22} />
        <span>Products</span>
      </Link>

      {/* ORDERS */}
      <Link href="/users/myorders" className={styles.navItem}>
        <ClipboardList size={22} />
        <span>My Orders</span>
      </Link>

    

      {/* CONTACT */}
      <Link href="/users/contactpage" className={styles.navItem}>
        <Phone size={22} />
        <span>Contact</span>
      </Link>

      <Link href="/users/profilepage" className={styles.navItem}>
        <User size={22} />
        <span>Account</span>
      </Link>

     
    </footer>
  );
}