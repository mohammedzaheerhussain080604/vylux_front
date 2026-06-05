"use client";

import { useEffect, useState } from "react";
import styles from "./cartpage.module.css";
import { useRouter } from "next/navigation";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  Package,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  /* ================= FETCH CART ================= */
  const fetchCart = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        "https://vylux-front.onrender.com/api/vylux/cart",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      setCartItems(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  /* ================= UPDATE QTY ================= */
  const updateQty = async (cart_id: number, quantity: number) => {
    try {
      await fetch("https://vylux-front.onrender.com/api/vylux/cart/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          cart_id,
          quantity,
        }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= INCREASE (OPTIMISTIC) ================= */
  const increaseQty = (item: any) => {
    const newQty = Number(item.quantity) + 1;

    setCartItems((prev) =>
      prev.map((p) =>
        p.cart_id === item.cart_id
          ? { ...p, quantity: newQty }
          : p
      )
    );

    updateQty(item.cart_id, newQty);
  };

  /* ================= DECREASE (OPTIMISTIC) ================= */
  const decreaseQty = (item: any) => {
    const moq = Number(item.moq || 1);
    const newQty = Math.max(Number(item.quantity) - 1, moq);

    setCartItems((prev) =>
      prev.map((p) =>
        p.cart_id === item.cart_id
          ? { ...p, quantity: newQty }
          : p
      )
    );

    updateQty(item.cart_id, newQty);
  };

  /* ================= DELETE ITEM ================= */
  const removeItem = async (id: number) => {
    setCartItems((prev) => prev.filter((i) => i.cart_id !== id));

    await fetch(`https://vylux-front.onrender.com/api/vylux/cart/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  /* ================= CLEAR CART ================= */
  const clearCart = async () => {
    setCartItems([]);

    await fetch("https://vylux-front.onrender.com/api/vylux/cart/clear", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  /* ================= TOTALS ================= */
  const totalItems = cartItems.length;

  const totalQty = cartItems.reduce(
    (sum, item) => sum + Number(item.quantity),
    0
  );

  const subtotal = cartItems.reduce(
    (sum, item) =>
      sum + Number(item.quantity) * Number(item.price),
    0
  );

  if (loading) return <p style={{ padding: 20 }}>Loading cart...</p>;

  if (!cartItems.length) {
    return (
      <div className={styles.emptyCart}>
        <ShoppingCart size={70} />
        <h2>Your Cart is Empty</h2>
        <p>Add products to continue shopping.</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.pageHeader}>
        <div>
          <h1>My Cart</h1>
          <p>Review your items before checkout</p>
        </div>

        <button className={styles.clearBtn} onClick={clearCart}>
          <Trash2 size={18} />
          Clear Cart
        </button>
      </div>

      <div className={styles.cartList}>
        {cartItems.map((item) => (
          <div key={item.cart_id} className={styles.cartCard}>
            <button
              className={styles.deleteBtn}
              onClick={() => removeItem(item.cart_id)}
            >
              <Trash2 size={18} />
            </button>

            <img
              src={item.main_image}
              className={styles.productImage}
            />

            <div className={styles.info}>
              <h2>{item.name}</h2>

              <p>
                {item.watt} | Model: {item.model}
              </p>

              <h3>
                ₹{Number(item.price).toLocaleString()}
                <span> / piece</span>
              </h3>

              <div className={styles.bottomRow}>
                <div className={styles.qtyBox}>
                  <button onClick={() => decreaseQty(item)}>
                    <Minus size={16} />
                  </button>

                  <span>{item.quantity}</span>

                  <button onClick={() => increaseQty(item)}>
                    <Plus size={16} />
                  </button>
                </div>

                <div className={styles.totalBox}>
                  <small>Total</small>

                  <strong>
                    ₹
                    {(
                      Number(item.price) *
                      Number(item.quantity)
                    ).toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.summaryCard}>
        <h2 className={styles.summaryTitle}>Order Summary</h2>

        <div className={styles.summaryRow}>
          <div>
            <Package size={18} />
            Total Items
          </div>
          <span>{totalItems}</span>
        </div>

        <div className={styles.summaryRow}>
          <div>
            <ClipboardList size={18} />
            Total Quantity
          </div>
          <span>{totalQty} pcs</span>
        </div>

        <div className={styles.summaryRow}>
          <strong>Subtotal</strong>
          <strong>₹{subtotal.toLocaleString()}</strong>
        </div>

        <div className={styles.actionRow}>
         <button
  className={styles.checkoutBtn}
  onClick={() => {
    if (!cartItems.length) return;

    sessionStorage.setItem(
      "checkoutItems",
      JSON.stringify(cartItems)
    );

    router.push("/users/checkoutpage");
  }}
>
  <ShoppingCart size={18} />
  Checkout
</button>
        </div>
      </div>
    </div>
  );
}