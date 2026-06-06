"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "./home.module.css";

import {
  Truck,
  ShieldCheck,
  BadgeCheck,
  Grid3X3,
  User,
  Plus,
  Minus,
} from "lucide-react";

/* ================= TYPES ================= */

type Banner = {
  id: number;
  name: string;
  link: string;
  image: string;
};

type Category = {
  id: number;
  name: string;
  link: string;
  image: string;
};

type Variant = {
  moq: number;
  price: number;
  stock?: number;
};

type Product = {
  id: number;
  name: string;
  model?: string;
  main_image?: string;
  images?: string[];
  variants?: Variant[];
};

/* ================= PAGE ================= */

const API = "https://vylux-front.onrender.com/api/vylux/home";

export default function HomePage() {
  const router = useRouter();

  const [heroBanners, setHeroBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});

  /* ================= FETCH PRODUCTS ================= */

  const fetchProducts = async () => {
    try {
      const res = await fetch(
        "https://vylux-front.onrender.com/api/vylux/products"
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        setProducts([]);
      }
    } catch (err) {
      console.error("PRODUCT FETCH ERROR:", err);
      setProducts([]);
    }
  };

  /* ================= HOME DATA ================= */

  const fetchHomeData = async () => {
    try {
      const [bannerRes, categoryRes] = await Promise.all([
        fetch(`${API}/banners`),
        fetch(`${API}/categories`),
      ]);

      const bannerData = await bannerRes.json();
      const categoryData = await categoryRes.json();

      setHeroBanners(Array.isArray(bannerData) ? bannerData : []);
      setCategories(Array.isArray(categoryData) ? categoryData : []);
    } catch (err) {
      console.error(err);
    }
  };

  /* ================= QTY HANDLERS ================= */

  const increaseQty = (id: number, step: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: (prev[id] || step) + step,
    }));
  };

  const decreaseQty = (id: number, step: number) => {
    setQuantities((prev) => {
      const current = prev[id] || step;
      return {
        ...prev,
        [id]: Math.max(step, current - step),
      };
    });
  };

  /* ================= INIT ================= */

  useEffect(() => {
    fetchHomeData();
    fetchProducts();
  }, []);

  /* ================= UI ================= */

  return (
    <div className={styles.container}>

      {/* HERO */}
      <section className={styles.heroSection}>
        <div className={styles.heroScroll}>
          {heroBanners.map((banner) => (
            <Link
              href={banner.link || "#"}
              key={banner.id}
              className={styles.heroCard}
            >
              <Image
                src={banner.image}
                alt={banner.name}
                fill
                sizes="100vw"
                className={styles.heroImage}
              />
            </Link>
          ))}
        </div>
      </section>

      {/* CATEGORY */}
      <section className={styles.section}>
        <div className={styles.titleRow}>
          <h3>Shop by Category</h3>
          <Link href="/users/productpage">View All</Link>
        </div>

        <div className={styles.categoryScroll}>
          {categories.map((item) => (
            <Link
              href={item.link || "#"}
              key={item.id}
              className={styles.categoryCard}
            >
              <div className={styles.categoryImage}>
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="120px"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <p>{item.name}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* PRODUCTS (YOUR REQUESTED DESIGN STYLE) */}
      <section className={styles.section}>
        <div className={styles.titleRow}>
          <h3>New Products</h3>
          <Link href="/users/productpage">View All</Link>

        </div>

        <div className={styles.scrollArea}>
          <div className={styles.productGrid}>
            {products.map((product) => {
              const variant = product.variants?.[0];

              const qty =
                quantities[product.id] || variant?.moq || 1;

              return (
                <div key={product.id} className={styles.productCard}>

                  {/* IMAGE */}
                  <img
                    src={
                      product.main_image ||
                      product.images?.[0] ||
                      "/placeholder.png"
                    }
                    alt={product.name}
                    className={styles.productImage}
                  />

                  {/* NAME */}
                  <h3 className={styles.productName}>
                    {product.name}
                  </h3>

                  {/* INFO */}
                  <div className={styles.infoBox}>

                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>MODEL</span>
                      <span className={styles.infoValue}>
                        {product.model || "N/A"}
                      </span>
                    </div>

                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>MOQ</span>
                      <span className={styles.infoValue}>
                        {variant?.moq || 1} PCS
                      </span>
                    </div>

                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>STOCK</span>
                      <span className={styles.stockValue}>
                        {(variant?.stock || 0) > 0
                          ? "In Stock"
                          : "Out of Stock"}
                      </span>
                    </div>

                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>
                        DEALER PRICE
                      </span>
                      <span className={styles.price}>
                        ₹{variant?.price || 0}
                      </span>
                    </div>
                  </div>

                  

                  {/* BUTTON */}
                  <button
                    className={styles.viewBtn}
                    onClick={() =>
                      router.push(
                        `/users/productdetails/${product.id}`
                      )
                    }
                  >
                    View Product
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY SECTION */}
      <section className={styles.section}>
        <h3 className={styles.whyTitle}>
          Why Choose VYLUX?
        </h3>

        <div className={styles.whyGrid}>
          <div><ShieldCheck size={28} /><span>Energy Efficient</span></div>
          <div><BadgeCheck size={28} /><span>BIS Certified</span></div>
          <div><ShieldCheck size={28} /><span>18-24 Months Warranty</span></div>
          <div><Grid3X3 size={28} /><span>Wide Product Range</span></div>
          <div><Truck size={28} /><span>Pan India Delivery</span></div>
          <div><User size={28} /><span>Dealer Support</span></div>
        </div>
      </section>

    </div>
  );
}