"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./checkout.module.css";
import { useRouter } from "next/navigation";

interface Product {
  id: number;
  name: string;
  watt: string;
  sku: string;
  qty: number;
  price: number;
  image: string;
}

export default function Checkout() {
  const [shopName, setShopName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [gstin, setGstin] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState("");
  const [showSummary, setShowSummary] = useState(false);
  const [gstRate, setGstRate] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);

  const router = useRouter();

  const [placingOrder, setPlacingOrder] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  /* ================= LOAD CART ================= */
  useEffect(() => {
    const data = sessionStorage.getItem("checkoutItems");

    if (data) {
      const cartItems = JSON.parse(data);

      const mapped = cartItems.map((item: any, index: number) => ({
        id: item.cart_id || index,
        name: item.name,
        watt: item.watt,
        sku: item.model || item.sku,
        qty: Number(item.quantity || 0),
        price: Number(item.price || 0),
        image: item.main_image,
      }));

      setProducts(mapped);
    }
  }, []);

  /* ================= PROFILE AUTO FILL ================= */
  useEffect(() => {

     const fetchGST = async () => {
    try {
      const res = await fetch(
        "http://localhost:5000/api/vylux/contact/settings"
      );

      const data = await res.json();

      if (data?.data?.gst_number) {
        // If GST % is stored as number (example: 18)
        setGstRate(Number(data.data.gst_number));
      }
    } catch (err) {
      console.log("GST fetch failed", err);
    }
  };

  fetchGST();

    const fetchProfile = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/vylux/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setShopName(data.user.shop_name || "");
          setCustomerName(data.user.name || "");
          setPhone(data.user.phone || "");
          setEmail(data.user.email || "");
          setGstin(data.user.gstin || "");
          setAddress(data.user.address || "");
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchProfile();
  }, []);

  /* ================= CALCULATIONS (FIXED SAFE VERSION) ================= */
  const subtotal = useMemo(() => {
    return products.reduce(
      (sum, item) => sum + (item.qty || 0) * (item.price || 0),
      0
    );
  }, [products]);

const gst = useMemo(() => {
  const rate = Number(gstRate);

  if (isNaN(rate) || rate <= 0) return 0;

  return subtotal * (rate / 100);
}, [subtotal, gstRate]);
  const total = useMemo(() => subtotal + gst, [subtotal, gst]);

  const totalQty = useMemo(() => {
    return products.reduce((sum, item) => sum + (item.qty || 0), 0);
  }, [products]);

  /* ================= SUMMARY DATA (FULL CLEAN) ================= */
  const summary = useMemo(() => {
    return {
      items: products.length,
      qty: totalQty,
      subtotal: subtotal.toFixed(2),
      gst: gst.toFixed(2),
      total: total.toFixed(2),
    };
  }, [products, subtotal, gst, total, totalQty]);

  /* ================= SAVE PROFILE ================= */
  const updateProfile = async () => {
    try {
      await fetch("http://localhost:5000/api/vylux/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shopName,
          gstin,
          address,
        }),
      });
    } catch (err) {
      console.log("Profile update failed (non-blocking)", err);
    }
  };

  /* ================= PLACE ORDER ================= */
  const placeOrder = async () => {

     if (placingOrder) return; // 

    if (
      !shopName.trim() ||
      !customerName.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !address.trim()
    ) {
      alert("Please fill all required fields");
      return;
    }

    try {

      setPlacingOrder(true); 
      await updateProfile();

      const payload = {
        shop_name: shopName,
        customer_name: customerName,
        phone,
        email,
        gstin,
        delivery_address: address,
        customer_message: message,

        products: products.map((item) => ({
          product_name: item.name,
          watt: item.watt,
          quantity: item.qty,
          unit_price: item.price,
          total_price: item.qty * item.price,
        })),

        subtotal,
        gst_amount: gst,
        grand_total: total,
      };

      const res = await fetch("http://localhost:5000/api/vylux/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || "Order failed");
        return;
      }

      sessionStorage.removeItem("checkoutItems");

      alert("Order placed successfully!");

      router.push(
        `/users/success?orderId=${data.order.order_number}`
      );
    } catch (err) {
      console.error(err);
      alert("Error placing order");
    }
     finally {
    setPlacingOrder(false); // 🔓 unlock
  }
  };

  if (!products.length) {
    return <p style={{ padding: 20 }}>No items in checkout</p>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Checkout</h1>

      <p className={styles.subtitle}>
        Review your order and confirm details
      </p>

      {/* CONTACT */}
      <div className={styles.card}>
        <h3 className={styles.heading}>Delivery & Contact Details</h3>

        <input className={styles.input} value={shopName}
          onChange={(e) => setShopName(e.target.value)}
          placeholder="shop name" />

        <input className={styles.input} value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          placeholder="customer name" />

        <input className={styles.input} value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="phone" />

        <div className={styles.twoColumn}>
          <input className={styles.input} value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email" />

          <input className={styles.input} value={gstin}
            onChange={(e) => setGstin(e.target.value)}
            placeholder="GSTIN" />
        </div>
      </div>

      {/* ADDRESS */}
      <div className={styles.card}>
        <h3 className={styles.heading}>Delivery Address</h3>
        <textarea className={styles.textarea}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Delivery Address"
        />
      </div>

      {/* PRODUCTS */}
      <div className={styles.card}>
        <h3 className={styles.heading}>
          Order Items ({products.length})
        </h3>

        {products.map((item) => (
          <div key={item.id} className={styles.productCard}>
            <img src={item.image} className={styles.productImage} />

            <div className={styles.productInfo}>
              <h4>{item.name}</h4>
              <span>{item.sku}</span>
            </div>

            <div className={styles.price}>
              <small>Qty: {item.qty}</small>
              <strong>
                ₹{(item.qty * item.price).toLocaleString()}
              </strong>
            </div>
          </div>
        ))}
      </div>

      {/* MESSAGE */}
      <div className={styles.card}>
        <h3 className={styles.heading}>Message (Optional)</h3>
        <textarea
          className={styles.textarea}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      {/* SUMMARY (NOW FULLY WORKING DATA) */}
      {showSummary && (
        <div className={styles.overlay} onClick={() => setShowSummary(false)}>
          <div className={styles.summarySheet} onClick={(e) => e.stopPropagation()}>
            <h2>Order Summary</h2>

            <div className={styles.summaryRow}>
              <span>Total Items</span>
              <span>{summary.items}</span>
            </div>

            <div className={styles.summaryRow}>
              <span>Total Quantity</span>
              <span>{summary.qty}</span>
            </div>

            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>₹{summary.subtotal}</span>
            </div>

            <div className={styles.summaryRow}>
<span>GST ({gstRate || 0}%)</span>
              <span>₹{summary.gst}</span>
            </div>

            <div className={styles.totalRow}>
              <span>Total</span>
              <span className={styles.tt}>₹{summary.total}</span>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM BAR */}
      <div className={styles.bottomBar}>
        <div>
          <p>Total Payable</p>
          <h2>₹{total.toLocaleString()}</h2>
        </div>

        <div className={styles.buttons}>
          <button
            className={styles.summaryBtn}
            onClick={() => setShowSummary(true)}
          >
            View Summary
          </button>

          <button className={styles.orderBtn} onClick={placeOrder}>
            Place Order →
          </button>
        </div>
      </div>
    </div>
  );
}