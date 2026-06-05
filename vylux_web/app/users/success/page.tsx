"use client";

import React, { useEffect } from "react";
import styles from "./sucess.module.css";
import { FaWhatsapp, FaCheck } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { useRouter, useSearchParams } from "next/navigation";

const OrderSuccess: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = searchParams.get("orderId");
  const date = searchParams.get("date");

  const formattedDate = date
    ? new Date(date).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "";

  /* ================= AUTO REDIRECT ================= */
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/users/homepage");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className={styles.pageContainer}>
      <div className={styles.successCard}>
        {/* Confetti */}
        <div className={styles.confettiContainer}>
          <span className={styles.c1}></span>
          <span className={styles.c2}></span>
          <span className={styles.c3}></span>
          <span className={styles.c4}></span>
          <span className={styles.c5}></span>
          <span className={styles.c6}></span>
          <span className={styles.c7}></span>
          <span className={styles.c8}></span>
          <span className={styles.c9}></span>
          <span className={styles.c10}></span>
        </div>

        {/* Success Icon */}
        <div className={styles.successIcon}>
          <FaCheck />
        </div>

        {/* Heading */}
        <h2 className={styles.heading}>
          Order Placed Successfully!
        </h2>

        <p className={styles.message}>
          Thank you for your order.
          <br />
          You will be redirected to home shortly...
        </p>

        {/* Order Details */}
        <div className={styles.orderDetails}>
          <div className={styles.detailBlock}>
            <span className={styles.label}>Order ID</span>
            <h3 className={styles.value}>
              #{orderId || "N/A"}
            </h3>
          </div>

          <div className={styles.detailBlockRight}>
            <span className={styles.label}>Date & Time</span>
            <h3 className={styles.dateValue}>
              {formattedDate || "N/A"}
            </h3>
          </div>
        </div>

        {/* Contact */}
        <div className={styles.actions}>
          <div className={styles.actionItem}>
            <div className={styles.iconWrapper}>
              <FaWhatsapp className={styles.whatsapp} />
            </div>
            <span>7358433622</span>
          </div>

          <div className={styles.actionItem}>
            <div className={styles.iconWrapper}>
              <MdEmail className={styles.email} />
            </div>
            <span>vyluxlighting@gmail.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;