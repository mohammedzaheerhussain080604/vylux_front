

"use client";

import Image from "next/image";
import styles from "./header.module.css";
import { ClipboardList,User, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import logo from "../../../../public/logo/brand_logo.jpeg";

export default function Header() {
  const router = useRouter();

  const [cartCount, setCartCount] = useState(0);

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  /* ================= FETCH CART ================= */
  const fetchCart = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/vylux/cart",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      // ✅ ONLY NUMBER OF ITEMS (NOT QUANTITY)
      setCartCount((data || []).length);
    } catch (err) {
      console.error("Cart fetch error:", err);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <div className={styles.headerWrapper}>
      <header className={styles.header}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <div className={styles.logoContainer}>
            <Image
              src={logo}
              alt="Vylux Logo"
              width={120}
              height={45}
              className={styles.logoImage}
              priority
            />
          </div>

          <div className={styles.divider}></div>

          <div className={styles.dealerText}>
            Dealer
            <br />
            Website
          </div>
        </div>

        {/* Right Icons */}
        <div className={styles.iconGroup}>
        

          <div className={styles.iconItem}>
            <div
              className={styles.cartWrapper}
              onClick={() => router.push("/users/cartpage")}
            >
              <ShoppingCart size={22} />

              {/* ✅ CART ITEM COUNT */}
              {cartCount > 0 && (
                <span className={styles.badge}>
                  {cartCount}
                </span>
              )}
            </div>

            
          </div>
        </div>
      </header>
    </div>
  );
}