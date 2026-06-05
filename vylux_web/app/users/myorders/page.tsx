"use client";

import jsPDF from "jspdf";

import { useEffect, useState, useMemo } from "react";
import styles from "./myorders.module.css";

interface OrderItem {
  product_name: string;
  watt?: string;
  quantity: number;
  unit_price: number;
  total_price?: number;
}

interface Order {
  id: number;
  order_number: string;
  created_at: string;
  grand_total: number;
  subtotal?: number;
  gst_amount?: number;
  status: string;

  shop_name?: string;
  customer_name?: string;
  phone?: string;
  email?: string;
  gstin?: string;
  delivery_address?: string;
}

const PAGE_SIZE = 6;

export default function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [itemsMap, setItemsMap] = useState<Record<number, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  /* ================= DATE ================= */
  const formatDate = (date: string) =>
    new Date(date).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      dateStyle: "medium",
      timeStyle: "short",
    });

  /* ================= FETCH ORDERS ================= */
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(
          "https://vylux-front.onrender.com/api/vylux/orders/my-orders",
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        const data = await res.json();

        if (!data.success) {
          setError(data.message || "Failed to load orders");
          return;
        }

        const sorted = (data.orders || []).sort(
          (a: Order, b: Order) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
        );

        setOrders(sorted);
      } catch (err) {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  /* ================= ITEMS ================= */
 const loadItems = async (orderId: number) => {
  try {
    const res = await fetch(
      `https://vylux-front.onrender.com/api/vylux/orders/${orderId}`,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      }
    );

    const data = await res.json();

    if (data.success) {
      setItemsMap((prev) => ({
        ...prev,
        [orderId]: data.items || [],
      }));
    }
  } catch (err) {
    console.log(err);
  }
};

  /* ================= TOGGLE ================= */
  const toggle = (id: number) => {
    setOpenId(openId === id ? null : id);
    loadItems(id);
  };

  /* ================= PAGINATION ================= */
  const totalPages = Math.max(1, Math.ceil(orders.length / PAGE_SIZE));

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return orders.slice(start, start + PAGE_SIZE);
  }, [orders, page]);

  const goNext = () => {
    if (page < totalPages) setPage((p) => p + 1);
  };

  const goPrev = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  /* ================= PDF DOWNLOAD (SIMPLE) ================= */
const downloadBill = async (order: Order) => {
  let items = itemsMap[order.id];

  // fetch items if missing
  if (!items) {
    try {
      const res = await fetch(
        `https://vylux-front.onrender.com/api/vylux/orders/${order.id}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      const data = await res.json();

      if (data.success) {
        items = data.items || [];

        setItemsMap((prev) => ({
          ...prev,
          [order.id]: items,
        }));
      } else {
        items = [];
      }
    } catch (err) {
      console.log(err);
      items = [];
    }
  }

  const pdf = new jsPDF();
  let y = 20;

  const safe = (v: any) => (v === null || v === undefined ? "-" : String(v));

  // ================= HEADER =================
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.text("VYLUX LIGHTING", 15, y);

  y += 8;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text("Phone: 7358433622", 15, y);
  y += 5;
  pdf.text("Email: vyluxlighting@gmail.com", 15, y);

  y += 10;
  pdf.line(15, y, 195, y);
  y += 10;

  // ================= INVOICE =================
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("TAX INVOICE", 15, y);

  y += 10;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");

  pdf.text(`Invoice No: INV-${order.id}`, 15, y);
  y += 6;

  pdf.text(`Order No: ${order.order_number}`, 15, y);
  y += 6;

  pdf.text(`Date: ${formatDate(order.created_at)}`, 15, y);
  y += 10;

  // ================= TABLE HEADER =================
  pdf.setFont("helvetica", "bold");

  pdf.text("Product", 15, y);
  pdf.text("Watt", 70, y);
  pdf.text("Qty", 120, y);
  pdf.text("Rate", 150, y);
  pdf.text("Amount", 185, y);

  y += 6;
  pdf.line(15, y, 195, y);
  y += 8;

  // ================= ITEMS =================
  pdf.setFont("helvetica", "normal");

  let subtotal = 0;

  (items || []).forEach((item) => {
    const qty = Number(item.quantity || 0);
    const rate = Number(item.unit_price || 0);
    const amount = qty * rate;

    subtotal += amount;

    pdf.text(safe(item.product_name), 15, y);
    pdf.text(safe(item.watt), 70, y);

    pdf.text(String(qty), 120, y);
    pdf.text(String(rate), 150, y);
    pdf.text(String(amount), 185, y);

    y += 7;

    if (y > 270) {
      pdf.addPage();
      y = 20;
    }
  });

  y += 5;
  pdf.line(15, y, 195, y);
  y += 10;

  // ================= USE REAL DB VALUES (IMPORTANT FIX) =================
  const subtotalDB = Number(order.subtotal || subtotal);
  const gstDB = Number(order.gst_amount || 0);
  const totalDB = Number(order.grand_total || subtotalDB + gstDB);
  const gstRate =
  subtotalDB > 0 ? ((gstDB / subtotalDB) * 100).toFixed(0) : 0;
  pdf.text(`Subtotal: ${subtotalDB.toFixed(2)}`, 15, y);
  y += 6;

pdf.text(`GST (${gstRate}%): ${gstDB.toFixed(2)}`, 15, y);
  y += 8;

  pdf.setFont("helvetica", "bold");
  pdf.text(`GRAND TOTAL: ${totalDB.toFixed(2)}`, 15, y);

  y += 10;

  pdf.setFont("helvetica", "normal");
  pdf.text("Thank you for your order!", 15, y);

  pdf.save(`Invoice-${order.order_number}.pdf`);
};
  /* ================= UI STATES ================= */
  if (loading) return <p className={styles.loading}>Loading...</p>;
  if (error) return <p className={styles.empty}>{error}</p>;
  if (!orders.length) return <p className={styles.empty}>No orders found</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>My Orders</h1>

      <div className={styles.list}>
        {paginatedOrders.map((order) => {
          const open = openId === order.id;
          const isDelivered = order.status === "Delivered";

          return (
            <div key={order.id} className={styles.card}>
              <div
                className={styles.cardHeader}
                onClick={() => toggle(order.id)}
              >
                <div>
                  <p className={styles.orderId}>
                    #{order.order_number}
                  </p>
                  <span className={styles.date}>
                    {formatDate(order.created_at)}
                  </span>
                </div>

                <span className={styles.status}>
                  {order.status}
                </span>
              </div>

              <div className={styles.cardFooter}>
                <span>Total</span>
                <strong>
                  ₹{Number(order.grand_total).toLocaleString()}
                </strong>
              </div>

              {/* DOWNLOAD BUTTON ONLY WHEN DELIVERED */}
              {isDelivered && (
                <button
                  onClick={() => downloadBill(order)}
                  style={{
                    marginTop: "8px",
                    padding: "6px 10px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#111827",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  Download Bill
                </button>
              )}

              {open && (
                <div className={styles.details}>
                  <h4>Items</h4>

                  {itemsMap[order.id] ? (
                    itemsMap[order.id].map((item, i) => (
                      <div key={i} className={styles.itemRow}>
                        <div>
                          <p className={styles.itemName}>
                            {item.product_name}
                          </p>
                          <small>
                            Qty: {item.quantity} × ₹{item.unit_price}
                          </small>
                        </div>

                        <strong>
                          ₹
                          {(
                            item.quantity * item.unit_price
                          ).toLocaleString()}
                        </strong>
                      </div>
                    ))
                  ) : (
                    <p className={styles.loadingSmall}>
                      Loading items...
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ================= PAGINATION (ONLY NEXT/PREV + COUNTER) ================= */}
      <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "15px" }}>
        <button onClick={goPrev} disabled={page === 1} className={styles.pbtn}>
          Prev
        </button>

        <span className={styles.pag}>
          {page} / {totalPages}
        </span>

        <button onClick={goNext} disabled={page === totalPages} className={styles.pbtn}>
          Next
        </button>
      </div>
    </div>
  );
}