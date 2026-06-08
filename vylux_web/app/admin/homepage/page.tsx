"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./adminhome.module.css";
import { Trash2 } from "lucide-react";

/* ==========================================================
   TYPES
========================================================== */

type Banner = {
  id: number;
  name: string;
  link: string;
  image?: string;
};

type Category = {
  id: number;
  name: string;
  link: string;
  image?: string;
};

/* ==========================================================
   API CONFIGURATION
========================================================== */

const API = "https://vylux-front.onrender.com/api/vylux/home";

/* ==========================================================
   COMPONENT
========================================================== */

export default function HomepageManagement() {

  /* ========================================================
     BANNER STATE
  ======================================================== */

  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannerName, setBannerName] = useState("");
  const [bannerLink, setBannerLink] = useState("");
  const [bannerImage, setBannerImage] = useState<File | null>(null);

  /* ========================================================
     CATEGORY STATE
  ======================================================== */

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryLink, setCategoryLink] = useState("");
  const [categoryImage, setCategoryImage] = useState<File | null>(null);

  /* ========================================================
     LOADING STATE
  ======================================================== */

  const [isAddingBanner, setIsAddingBanner] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  /* ========================================================
     FILE INPUT REFERENCES
  ======================================================== */

  const bannerFileRef = useRef<HTMLInputElement>(null);
  const categoryFileRef = useRef<HTMLInputElement>(null);

  /* ========================================================
     INITIAL DATA LOADING
  ======================================================== */

  useEffect(() => {
    loadHomepageData();
  }, []);

  const loadHomepageData = async () => {
    await Promise.all([getBanners(), getCategories()]);
  };

  /* ========================================================
     DATA FETCHING
  ======================================================== */

  const getBanners = async () => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      const response = await fetch(`${API}/banners`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setBanners(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch banners:", error);
    }
  };

  const getCategories = async () => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      const response = await fetch(`${API}/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  /* ========================================================
     IMAGE UPLOAD HANDLER
  ======================================================== */

  const handleImageUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: "banner" | "category"
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (type === "banner") {
      setBannerImage(file);
    } else {
      setCategoryImage(file);
    }
  };

  /* ========================================================
     BANNER CRUD OPERATIONS
  ======================================================== */

  const createBanner = async () => {
    if (!bannerName.trim() || !bannerLink.trim()) {
      alert("Please fill all fields");
      return;
    }

    if (isAddingBanner) return;

    try {
      setIsAddingBanner(true);

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      const formData = new FormData();
      formData.append("name", bannerName);
      formData.append("link", bannerLink);

      if (bannerImage) {
        formData.append("image", bannerImage);
      }

      const response = await fetch(`${API}/banner`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create banner");
      }

      setBannerName("");
      setBannerLink("");
      setBannerImage(null);

      if (bannerFileRef.current) {
        bannerFileRef.current.value = "";
      }

      await getBanners();
    } catch (error) {
      console.error(error);
      alert("Failed to add banner");
    } finally {
      setIsAddingBanner(false);
    }
  };

  const removeBanner = async (id: number) => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      await fetch(`${API}/banner/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await getBanners();
    } catch (error) {
      console.error("Failed to delete banner:", error);
    }
  };

  /* ========================================================
     CATEGORY CRUD OPERATIONS
  ======================================================== */

  const createCategory = async () => {
    if (!categoryName.trim() || !categoryLink.trim()) {
      alert("Please fill all fields");
      return;
    }

    if (isAddingCategory) return;

    try {
      setIsAddingCategory(true);

      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      const formData = new FormData();
      formData.append("name", categoryName);
      formData.append("link", categoryLink);

      if (categoryImage) {
        formData.append("image", categoryImage);
      }

      const response = await fetch(`${API}/category`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create category");
      }

      setCategoryName("");
      setCategoryLink("");
      setCategoryImage(null);

      if (categoryFileRef.current) {
        categoryFileRef.current.value = "";
      }

      await getCategories();
    } catch (error) {
      console.error(error);
      alert("Failed to add category");
    } finally {
      setIsAddingCategory(false);
    }
  };

  const removeCategory = async (id: number) => {
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      await fetch(`${API}/category/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await getCategories();
    } catch (error) {
      console.error("Failed to delete category:", error);
    }
  };


 
  /* ========================================================
     UI
  ======================================================== */

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Homepage Management</h1>
      </div>

      {/* HERO BANNERS */}

      <section className={styles.section}>
        <div className={styles.sectionTop}>
          <div>
            <h2>Hero Banners</h2>
            <p>Manage homepage slider banners</p>
          </div>
        </div>

        <div className={styles.formCard}>
          <h3>Add New Banner</h3>

          <div className={styles.formGrid}>
            <input
              placeholder="Banner Name"
              value={bannerName}
              onChange={(e) => setBannerName(e.target.value)}
            />

            <input
              placeholder="Banner Link"
              value={bannerLink}
              onChange={(e) => setBannerLink(e.target.value)}
            />

            <input
              ref={bannerFileRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "banner")}
            />
          </div>

          <button
            className={styles.submitBtn}
            onClick={createBanner}
            disabled={isAddingBanner}
          >
            {isAddingBanner ? "Adding..." : "Add Banner"}
          </button>
        </div>

        <h3 className={styles.previewTitle}>Banner Preview</h3>

        <div className={styles.horizontalScroll}>
          {banners.map((banner) => (
            <div key={banner.id} className={styles.bannerCard}>
              <div className={styles.bannerImage}>
                {banner.image ? (
                  <img
                    src={banner.image}
                    alt={banner.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  "No Image"
                )}
              </div>

              <div className={styles.bannerInfo}>
                <div>
                  <h4>{banner.name}</h4>
                  <p>{banner.link}</p>
                </div>

                <button
                  className={styles.delete}
                  onClick={() => removeBanner(banner.id)}
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SHOP BY CATEGORY */}

      <section className={styles.section}>
        <div className={styles.sectionTop}>
          <div>
            <h2>Shop By Category</h2>
            <p>Manage homepage categories</p>
          </div>
        </div>

        <div className={styles.formCard}>
          <h3>Add New Category</h3>

          <div className={styles.formGrid}>
            <input
              placeholder="Category Name"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
            />

            <input
              placeholder="Category Link"
              value={categoryLink}
              onChange={(e) => setCategoryLink(e.target.value)}
            />

            <input
              ref={categoryFileRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, "category")}
            />
          </div>

          <button
            className={styles.submitBtn}
            onClick={createCategory}
            disabled={isAddingCategory}
          >
            {isAddingCategory ? "Adding..." : "Add Category"}
          </button>
        </div>

        <h3 className={styles.previewTitle}>Category Preview</h3>

        <div className={styles.horizontalScroll}>
          {categories.map((category) => (
            <div key={category.id} className={styles.categoryCard}>
              <div className={styles.categoryImage}>
                {category.image && (
                  <img
                    src={category.image}
                    alt={category.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                )}
              </div>

              <h4>{category.name}</h4>
              <p>{category.link}</p>

              <button
                className={styles.delete}
                onClick={() => removeCategory(category.id)}
              >
                <Trash2 size={15} />
                Delete
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}