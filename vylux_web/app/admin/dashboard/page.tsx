"use client";

import { useEffect, useState } from "react";
import styles from "./dashboard.module.css";
import { useRouter } from "next/navigation";

interface Stats {
  users: number;
  products: number;
  revenue: number;
  totalOrders: number;
  pending: number;
  accepted: number;
  delivered: number;
}

interface Product {
  id: number;
  name: string;
  model: string;
}

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  shop_name?: string;
  grand_total: number;
  status: string;
}

interface DashboardData {
  stats: Stats;
  topProducts: Product[];
  lowProducts: Product[];
  recentOrders: Order[];
}

// =====================
// TOKEN HELPER
// =====================
const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const router = useRouter();
 const [authorized, setAuthorized] = useState(false);

useEffect(() => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    router.replace("/admin/login");
    return;
  }

  if (role !== "admin") {
    router.replace("/unauthorized");
    return;
  }

  setAuthorized(true);
}, [router]);


 useEffect(() => {
  if (!authorized) return;

  const load = async () => {
    const token = getToken();

    try {
      const res = await fetch(
        "https://vylux-front.onrender.com/api/vylux/dashboard/stats",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();

      if (!json.success) {
        throw new Error("Dashboard failed");
      }

      setData(json);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  load();
}, [authorized]);

  if (!authorized) return null;
  if (loading) return <div className={styles.loading}>Loading...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!data) return <div className={styles.error}>No Data</div>;

  const s = data.stats;

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <h1>Admin Dashboard</h1>
        <p>Business Overview Panel</p>
      </div>

      {/* KPI GRID */}
      <div className={styles.kpiGrid}>
        <div className={styles.card}>Users <b>{s.users}</b></div>
        <div className={styles.card}>Products <b>{s.products}</b></div>
        <div className={styles.card}>Orders <b>{s.totalOrders}</b></div>
        <div className={styles.card}>Revenue <b>₹{s.revenue}</b></div>

        <div className={styles.card}>Pending <b>{s.pending}</b></div>
        <div className={styles.card}>Accepted <b>{s.accepted}</b></div>
        <div className={styles.card}>Delivered <b>{s.delivered}</b></div>
      </div>

      {/* TOP PRODUCTS */}
      <div className={styles.section}>
        <h2>Top Selling Products</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Model</th>
            </tr>
          </thead>
          <tbody>
            {data.topProducts.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.model}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* LOW PRODUCTS */}
      <div className={styles.section}>
        <h2>Low Selling Products</h2>
        <table className={styles.table}>
          <tbody>
            {data.lowProducts.map((p) => (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.model}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* RECENT ORDERS */}
      <div className={styles.section}>
        <h2>Recent Orders</h2>

        <div className={styles.scrollBox}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Shop</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              {data.recentOrders.slice(0, 10).map((o) => (
                <tr key={o.id}>
                  <td>#{o.order_number}</td>
                  <td>{o.customer_name}</td>
                  <td>{o.shop_name || "-"}</td>
                  <td>{o.status}</td>
                  <td>₹{o.grand_total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}