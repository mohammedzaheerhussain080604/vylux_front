"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  Minus,
  Plus,
  FileText,
  BadgePercent,
  Package,
  Truck,
  Headphones,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useRouter } from "next/navigation";

import styles from "./productpage.module.css";

export default function ProductListing() {
  /* =========================
     STATES
  ========================= */
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<any>("All");

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("Low to High");

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [currentPage, setCurrentPage] = useState(1);

  const productsPerPage = 6;

  /* =========================
     FETCH CATEGORIES
  ========================= */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(
          "https://vylux-front.onrender.com/api/vylux/home/categories"
        );
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };

    fetchCategories();
  }, []);

  /* =========================
     FETCH PRODUCTS (BACKEND FILTER)
  ========================= */
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `https://vylux-front.onrender.com/api/vylux/products?search=${search}&category=${
            selectedCategory === "All" ? "" : selectedCategory
          }`
        );

        const data = await res.json();

        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [search, selectedCategory]);

  /* =========================
     RESET PAGE ON FILTER CHANGE
  ========================= */
  useEffect(() => {
  const delay = setTimeout(() => {
    fetchProducts();
  }, 300); // debounce

  return () => clearTimeout(delay);
}, [search, selectedCategory]);

const fetchProducts = async () => {
  try {
    setLoading(true);

    const res = await fetch(
      `https://vylux-front.onrender.com/api/vylux/products?search=${search}&category=${
        selectedCategory === "All" ? "" : selectedCategory
      }`
    );

    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Failed to fetch products:", err);
    setProducts([]);
  } finally {
    setLoading(false);
  }
};
  /* =========================
     SORT PRODUCTS
  ========================= */
  const sortedProducts = useMemo(() => {
    const data = [...products];

    return data.sort((a, b) => {
      const aPrice = a.variants?.[0]?.price || 0;
      const bPrice = b.variants?.[0]?.price || 0;

      return sortBy === "Low to High"
        ? aPrice - bPrice
        : bPrice - aPrice;
    });
  }, [products, sortBy]);

  /* =========================
     PAGINATION
  ========================= */
  const totalPages = Math.ceil(sortedProducts.length / productsPerPage);

  const displayedProducts = sortedProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  /* =========================
     QUANTITY HANDLERS
  ========================= */
  const increaseQty = (id: number, moq: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: (prev[id] || moq) + 1,
    }));
  };

  const decreaseQty = (id: number, moq: number) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max((prev[id] || moq) - 1, moq),
    }));
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <div className={styles.container}>
      <div className={styles.stickyTop}>
       

        {/* ================= CATEGORIES ================= */}
        <div className={styles.categoryWrapper}>
          <button
            onClick={() => setSelectedCategory("All")}
            className={
              selectedCategory === "All"
                ? styles.activeCategory
                : styles.categoryBtn
            }
          >
            All Products
          </button>

          {categories.map((item: any) => (
            <button
              key={item.id}
              onClick={() => setSelectedCategory(item.id)}
              className={
                selectedCategory === item.id
                  ? styles.activeCategory
                  : styles.categoryBtn
              }
            >
              {item.name}
            </button>
          ))}
        </div>

        {/* TOP BAR */}
        <div className={styles.topBar}>
          <p>{sortedProducts.length} Products</p>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.sortSelect}
          >
            <option>Low to High</option>
            <option>High to Low</option>
          </select>
        </div>
      </div>

      {/* ================= PRODUCTS ================= */}
      <div className={styles.scrollArea}>
        <div className={styles.productGrid}>
          {displayedProducts.map((product) => {
            const variant = product.variants?.[0];

            return (
              <div key={product.id} className={styles.productCard}>
                <img
                  src={product.main_image || product.images?.[0]}
                  alt={product.name}
                  className={styles.productImage}
                />

                <h3 className={styles.productName}>{product.name}</h3>

                <div className={styles.infoBox}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>MODEL</span>
                    <span className={styles.infoValue}>
                      {product.model}
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
                    <span className={styles.stockValue}>In Stock</span>
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

                {/* QTY */}
                <div className={styles.qtyBox}>
                  <button
                    onClick={() =>
                      decreaseQty(product.id, variant?.moq || 1)
                    }
                  >
                    <Minus size={14} />
                  </button>

                  <span>
                    {quantities[product.id] || variant?.moq || 1}
                  </span>

                  <button
                    onClick={() =>
                      increaseQty(product.id, variant?.moq || 1)
                    }
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
  className={styles.viewBtn}
  onClick={() => router.push(`/users/productdetails/${product.id}`)}
>
  View Product
</button>

               
              </div>
            );
          })}
        </div>

        {/* ================= PAGINATION ================= */}
        <div className={styles.pagination}>
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            <ChevronLeft size={16} /> Prev
          </button>

          <div className={styles.pageNumbers}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={
                    currentPage === page ? styles.activePage : ""
                  }
                >
                  {page}
                </button>
              )
            )}
          </div>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>

        {/* ================= WHY SECTION ================= */}
        <section className={styles.whySection}>
          <h2>Why Partner With VYLUX?</h2>

          <div className={styles.whyRow}>
            <div className={styles.whyItem}>
              <FileText size={20} />
              <span>GST Billing</span>
            </div>

            <div className={styles.whyItem}>
              <BadgePercent size={20} />
              <span>Best Prices</span>
            </div>

            <div className={styles.whyItem}>
              <Package size={20} />
              <span>Bulk Stock</span>
            </div>

            <div className={styles.whyItem}>
              <Truck size={20} />
              <span>Fast Dispatch</span>
            </div>

            <div className={styles.whyItem}>
              <Headphones size={20} />
              <span>24/7 Support</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}