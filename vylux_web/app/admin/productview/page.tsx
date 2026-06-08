"use client";

import { useEffect, useState } from "react";
import styles from "./productview.module.css";
import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Category = {
  id: number;
  name: string;
};

type Variant = {
  watt: string;
  price: string;
  moq: string;
  stock: string;
};

type Product = {
  id: number;
  name: string;
  model: string;
  category: number | string;
  category_name?: string;

  power_consumption: string;
  color_temperature: string;
  operating_voltage: string;
  average_life: string;
  warranty: string;

  main_image: string;
  variants?: Variant[];
};

const API = "https://vylux-front.onrender.com/api/vylux";

export default function Productview() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sort, setSort] = useState("");

  const router = useRouter();

  const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

const getRole = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("role");
};

  // ================= ADMIN PROTECTION (IMPORTANT) =================
 useEffect(() => {
  const token = getToken();
  const role = getRole();

  if (!token) {
    window.location.replace("/admin/login");
    return;
  }

  if (role !== "admin") {
    window.location.replace("/admin/login");
    return;
  }
}, []);

  useEffect(() => {
  const token = getToken();
  const role = getRole();

  if (!token) {
    window.location.replace("/admin/login");
    return;
  }

  if (role !== "admin") {
    window.location.replace("/admin/login");
    return;
  }

  // ONLY fetch after validation
  fetchCategories();
  fetchProducts();
}, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API}/home/categories`);
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/products`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id: number) => {
    const ok = confirm("Delete this product?");
    if (!ok) return;

    try {
      const res = await fetch(`${API}/products/${id}`, {
  method: "DELETE",
  headers: {
    Authorization: `Bearer ${getToken()}`,
  },
});

      if (!res.ok) throw new Error("Delete failed");

      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete product");
    }
  };

  // ================= EDIT =================
  const handleEdit = (id: number) => {
    router.push(`/admin/editproduct/${id}`);
  };

  const filteredProducts = products
    .filter((p) =>
      p.name?.toLowerCase().includes(search.toLowerCase())
    )
    .filter((p) =>
      selectedCategory === "All"
        ? true
        : p.category_name === selectedCategory
    )
    .sort((a, b) => {
      const aPrice = Number(a.variants?.[0]?.price ?? 0);
      const bPrice = Number(b.variants?.[0]?.price ?? 0);

      if (sort === "low-high") return aPrice - bPrice;
      if (sort === "high-low") return bPrice - aPrice;
      return 0;
    });


  return (
    <div className={styles.cont}>
      {/* SEARCH */}
      <input
        type="text"
        placeholder="Search products..."
        className={styles.searchBar}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* CATEGORY */}
      <div className={styles.categoryScroll}>
        <button
          className={styles.categoryChip}
          onClick={() => setSelectedCategory("All")}
        >
          All
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            className={styles.categoryChip}
            onClick={() => setSelectedCategory(cat.name)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* TOP BAR */}
      <div className={styles.productRow}>
        <span className={styles.totalProducts}>
          Total Products: <strong>{filteredProducts.length}</strong>
        </span>

        <select
          className={styles.sortDropdown}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">Sort</option>
          <option value="low-high">Lowest to Highest</option>
          <option value="high-low">Highest to Lowest</option>
        </select>
      </div>

      {/* PRODUCTS */}
      <div className={styles.productList}>
        {filteredProducts.map((p) => (
          <div className={styles.productCard} key={p.id}>
            {/* ACTIONS */}
            <div className={styles.cardHeader}>
              <div className={styles.cardActions}>
                <button
                  className={styles.editBtn}
                  onClick={() => handleEdit(p.id)}
                >
                  <Pencil size={16} />
                </button>

                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(p.id)}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* TOP */}
            <div className={styles.productTop}>
              <div className={styles.productImage}>
                <img
                  src={p.main_image || "/placeholder.png"}
                  alt={p.name}
                />
              </div>

              <div className={styles.productDetails}>
                <h3>{p.name}</h3>

                <p>
                  <strong>Model:</strong> {p.model}
                </p>

                <p>
                  <strong>Category:</strong>{" "}
                  {p.category_name || "N/A"}
                </p>

                <p className={styles.status}>● Active</p>
              </div>

              {/* TECH SPECS */}
              <div className={styles.techSpecs}>
                <div className={styles.specRow}>
                  <span>Power</span>
                  <strong>
                    {p.power_consumption
                      ? `${p.power_consumption} W`
                      : "-"}
                  </strong>
                </div>

                <div className={styles.specRow}>
                  <span>Color</span>
                  <strong>{p.color_temperature || "-"}</strong>
                </div>

                <div className={styles.specRow}>
                  <span>Voltage</span>
                  <strong>
                    {p.operating_voltage
                      ? `${p.operating_voltage} V`
                      : "-"}
                  </strong>
                </div>

                <div className={styles.specRow}>
                  <span>Life</span>
                  <strong>
                    {p.average_life
                      ? `${p.average_life} hrs`
                      : "-"}
                  </strong>
                </div>

                <div className={styles.specRow}>
                  <span>Warranty</span>
                  <strong>{p.warranty || "-"}</strong>
                </div>
              </div>
            </div>

            {/* VARIANTS */}
            <div className={styles.variantSection}>
              <h4>Variants</h4>

              <table className={styles.variantTable}>
                <thead>
                  <tr>
                    <th>Watt</th>
                    <th>Price</th>
                    <th>MOQ</th>
                    <th>Stock</th>
                  </tr>
                </thead>

                <tbody>
                  {p.variants?.length ? (
                    p.variants.map((v, i) => (
                      <tr key={i}>
                        <td>{v.watt}</td>
                        <td>₹{v.price}</td>
                        <td>{v.moq}</td>
                        <td>{v.stock}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center" }}>
                        No variants
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}