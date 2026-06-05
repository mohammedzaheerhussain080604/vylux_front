"use client";

import styles from "./adminfooter.module.css";
import Link from "next/link";

import {
  LayoutDashboard,
  Home,
  ShoppingBag,
  PlusCircle,
  FileText,
  Settings,
  Clipboard
} from "lucide-react";

export default function AdminFooter() {
  return (
    <footer className={styles.footer}>
      <Link href="/admin/dashboard" className={styles.navItem}>
        <LayoutDashboard size={20} />
        <span>Dashboard</span>
      </Link>

      <Link href="/admin/homepage" className={styles.navItem}>
        <Home size={20} />
        <span>Home</span>
      </Link>

      <Link href="/admin/productview" className={styles.navItem}>
        <ShoppingBag size={20} />
        <span>Products</span>
      </Link>

      <Link href="/admin/addproduct" className={styles.navItem}>
        <PlusCircle size={20} />
        <span>Add</span>
      </Link>

      <Link href="/admin/orders" className={styles.navItem}>
        <Clipboard size={20} />
        <span>Orders</span>
      </Link>

     

      <Link href="/admin/contactpage" className={styles.navItem}>
        <Settings size={20} />
        <span>Settings</span>
      </Link>
    </footer>
  );
}