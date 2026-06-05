"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./orders.module.css";

interface OrderItem {
  product_name: string;
  watt?: string;
  quantity: number;
  unit_price: number;
}

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  phone: string;
  email?: string;
  gstin?: string;
  delivery_address?: string;
  status: string;
  grand_total: number;
  created_at: string;
}

const PAGE_SIZE = 7;

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [itemsMap, setItemsMap] = useState<Record<number, OrderItem[]>>({});
  const [openId, setOpenId] = useState<number | null>(null);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  /* ================= FETCH ORDERS ================= */
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(
          "http://localhost:5000/api/vylux/orders/admin/all",
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.log(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  /* ================= FETCH ITEMS ================= */
  const loadItems = async (id: number) => {
    if (itemsMap[id]) return;

    const res = await fetch(
      `http://localhost:5000/api/vylux/orders/admin/${id}`,
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
        [id]: data.items || [],
      }));
    }
  };

  /* ================= UPDATE STATUS ================= */
  const updateStatus = async (id: number, status: string) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/vylux/orders/admin/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? { ...o, status } : o))
        );
      }
    } catch (err) {
      console.log(err);
    }
  };

  /* ================= RESET FILTER ================= */
  const resetFilters = () => {
    setSearch("");
    setSort("newest");
    setStatusFilter("All");
    setPage(1);
  };

  /* ================= FILTER + SORT ================= */
  const filteredOrders = useMemo(() => {
    let data = [...orders];

    if (search) {
      data = data.filter(
        (o) =>
          o.order_number.toLowerCase().includes(search.toLowerCase()) ||
          o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
          o.phone.includes(search)
      );
    }

    if (statusFilter !== "All") {
      data = data.filter((o) => o.status === statusFilter);
    }

    if (sort === "newest") {
      data.sort(
        (a, b) =>
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
      );
    }

    if (sort === "oldest") {
      data.sort(
        (a, b) =>
          new Date(a.created_at).getTime() -
          new Date(b.created_at).getTime()
      );
    }

    if (sort === "high") {
      data.sort((a, b) => b.grand_total - a.grand_total);
    }

    if (sort === "low") {
      data.sort((a, b) => a.grand_total - b.grand_total);
    }

    return data;
  }, [orders, search, sort, statusFilter]);

  /* ================= PAGINATION ================= */
  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrders.length / PAGE_SIZE)
  );

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, page]);

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const toggle = (id: number) => {
    setOpenId(openId === id ? null : id);
    loadItems(id);
  };

  if (loading) return <p className={styles.loading}>Loading...</p>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Admin Orders</h1>

      {/* ================= TOP BAR ================= */}
      <div className={styles.topBar}>
        <input
          className={styles.search}
          placeholder="Search order / name / phone"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <div>
          <select
            className={styles.select}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="high">High Price</option>
            <option value="low">Low Price</option>
          </select>

          <select
            className={styles.select}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">All</option>
            <option value="Pending">Pending</option>
            <option value="Accepted">Accepted</option>
            <option value="Delivered">Delivered</option>
          </select>

          <button className={styles.resetBtn} onClick={resetFilters}>
            Reset
          </button>
        </div>
      </div>

      {/* ================= LIST ================= */}
      <div className={styles.list}>
        {paginatedOrders.map((order) => {
          const open = openId === order.id;
          const isDelivered = order.status === "Delivered";

          return (
            <div key={order.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <div onClick={() => toggle(order.id)}>
                  <p className={styles.orderId}>
                    #{order.order_number}
                  </p>
                  <p className={styles.smallText}>
                    {order.customer_name} • {order.phone}
                  </p>
                </div>

                <div className={styles.right}>
                  <span className={styles.amount}>
                    ₹{order.grand_total}
                  </span>

                  <select
                    className={styles.status}
                    value={order.status}
                    disabled={isDelivered}
                    onChange={(e) =>
                      updateStatus(order.id, e.target.value)
                    }
                  >
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>

              {open && (
                <div className={styles.details}>
                  <div className={styles.section}>
                    <h4>Customer Details</h4>
                    <p><b>Name:</b> {order.customer_name}</p>
                    <p><b>Phone:</b> {order.phone}</p>
                    <p><b>Email:</b> {order.email || "-"}</p>
                    <p><b>GSTIN:</b> {order.gstin || "-"}</p>
                    <p><b>Address:</b> {order.delivery_address || "-"}</p>
                  </div>

                  <div className={styles.section}>
                    <h4>Items</h4>

                    {itemsMap[order.id]?.map((item, i) => (
                      <div key={i} className={styles.itemRow}>
                        <div>
                          <p className={styles.itemName}>
                            {item.product_name}
                          </p>
                          <small>
                            Watt: {item.watt || "-"} | Qty: {item.quantity}
                          </small>
                        </div>

                        <b>
                          ₹
                          {(item.quantity * item.unit_price).toLocaleString()}
                        </b>
                      </div>
                    )) || (
                      <p className={styles.loadingSmall}>
                        Loading items...
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ================= PAGINATION (ONLY PREV / NEXT + COUNTER) ================= */}
      <div className={styles.paginationBar}>
        <button onClick={() => goToPage(page - 1)} disabled={page === 1}>
          Prev
        </button>

        <span className={styles.smallText}>
          Page {page} / {totalPages}
        </span>

        <button onClick={() => goToPage(page + 1)} disabled={page === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}