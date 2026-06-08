"use client";

import { useState, useEffect } from "react";
import styles from "./addproduct.module.css";

export default function AddProduct() {
  type Category = {
    id: number;
    name: string;
  };

  type Variant = {
    id: number;
    watt: string;
    price: string;
    moq: string;
    stock: string;
  };

  // =====================
  // STATE
  // =====================

  const [preview, setPreview] = useState<string | null>(null);

  // BASIC INFO
  const [productName, setProductName] = useState("");
  const [modelNumber, setModelNumber] = useState("");
  const [page, setPage] = useState<"info" | "specs">("info");
  // CATEGORY
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  // IMAGES
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  // WARRANTY
  const [warranty, setWarranty] = useState("");

  // TECH SPECS
  const [power, setPower] = useState("");
  const [colorTemperature, setColorTemperature] = useState("");
  const [ratedVoltage, setRatedVoltage] = useState("");
  const [operatingVoltage, setOperatingVoltage] = useState("");
  const [averageLife, setAverageLife] = useState("");

  // VARIANTS
  const [variants, setVariants] = useState<Variant[]>([]);
  const [variantWatt, setVariantWatt] = useState("");
  const [price, setPrice] = useState("");
  const [moq, setMoq] = useState("");
  const [stock, setStock] = useState("");

  // =====================
  // FETCH CATEGORIES
  // =====================
  useEffect(() => {
    const fetchCategories = async () => {
  try {
    const res = await fetch(
      "https://vylux-front.onrender.com/api/vylux/home/categories"
    );

    if (!res.ok) throw new Error("Failed to fetch categories");

    const data = await res.json();
    setCategories(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Category fetch failed", err);
  }
};

    fetchCategories();
  }, []);

  const addVariant = () => {
  if (!variantWatt || !price || !moq || !stock) {
    alert("All variant fields are required");
    return;
  }

  const newVariant: Variant = {
    id: Date.now(),
    watt: variantWatt,
    price,
    moq,
    stock,
  };

  setVariants((prev) => [...prev, newVariant]);

  setVariantWatt("");
  setPrice("");
  setMoq("");
  setStock("");
};

  // =====================
  // SAVE PRODUCT
  // =====================
const handleSave = async () => {
  try {
    // VALIDATION
    if (!productName.trim())
      return alert("Product Name required");

    if (!modelNumber.trim())
      return alert("Model Number required");

    if (!categoryId)
      return alert("Category required");

    if (!mainImageFile)
      return alert("Main Image required");

    const selectedCategory = categories.find(
      (c) => c.id === categoryId
    );

    if (!selectedCategory)
      return alert("Invalid Category");

    const formData = new FormData();

    // BASIC
    formData.append("name", productName);
    formData.append("model", modelNumber);
    formData.append("category", String(categoryId));

    // SPECS
    formData.append("powerConsumption", power);
    formData.append("colorTemperature", colorTemperature);
    formData.append("ratedVoltage", ratedVoltage);
    formData.append("operatingVoltage", operatingVoltage);
    formData.append("averageLife", averageLife);
    formData.append("warranty", warranty);

    // IMAGES
    formData.append("mainImage", mainImageFile);

    galleryFiles.forEach((file) => {
      formData.append("galleryImages", file);
    });

    // VARIANTS
    formData.append(
      "variants",
      JSON.stringify(
        variants.map((v) => ({
          watt: v.watt,
          price: v.price,
          moq: v.moq,
          stock: v.stock,
        }))
      )
    );

    // ✅ FIX: ADD TOKEN HERE (THIS WAS MISSING)
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null;

    const res = await fetch(
      "https://vylux-front.onrender.com/api/vylux/products",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return alert(data.message || "Save failed");
    }

    alert("Product Created Successfully");

    // RESET
    setProductName("");
    setModelNumber("");
    setCategoryId(null);

    setMainImageFile(null);
    setGalleryFiles([]);

    setPower("");
    setColorTemperature("");
    setRatedVoltage("");
    setOperatingVoltage("");
    setAverageLife("");
    setWarranty("");

    setVariants([]);
  } catch (err) {
    console.error(err);
    alert("Server Error");
  }
};


  return (
    <div className={styles.cont}>
   <h1 className={styles.head}>
  ADD PRODUCT
</h1>
{/* ================= PAGE 1 FULL ================= */}
{page === "info" && (
  <>
    <div className={styles.cont}>
      {/* PRODUCT INFO */}
      <div className={styles.prodecont}>
        <h2 className={styles.phead}>Product Information</h2>

        {/* PRODUCT NAME */}
        <div className={styles.proname}>
          <p className={styles.lhead}>Product Name *</p>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="Enter Product Name"
            className={styles.pname}
          />
        </div>

        {/* MODEL + CATEGORY */}
        <div className={styles.pdiv}>
          <div className={styles.row}>
            <div className={styles.field}>
              <p className={styles.lhead}>Model Number *</p>
              <input
                type="text"
                value={modelNumber}
                onChange={(e) => setModelNumber(e.target.value)}
                placeholder="Enter Model Number"
                className={styles.pdin}
              />
            </div>

            <div className={styles.field}>
              <p className={styles.lhead}>Category *</p>

              <select
                value={categoryId ?? ""}
                onChange={(e) =>
                  setCategoryId(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                className={styles.pdin}
              >
                <option value="">Select Category</option>

                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* MAIN IMAGE */}
        <h3 className={styles.subHead}>Main Image *</h3>

        <div className={styles.imageUploadContainer}>
          <label className={styles.uploadBox}>
            <div className={styles.uploadText}>
              <p>Upload Main Image</p>
              <p>(jpg, jpeg, png | max 5MB)</p>
            </div>

            {mainImageFile && (
              <img
                src={URL.createObjectURL(mainImageFile)}
                className={styles.uploadPreviewImg}
                onClick={() =>
                  setPreview(URL.createObjectURL(mainImageFile))
                }
              />
            )}

            <input
              type="file"
              hidden
              accept=".jpg,.jpeg,.png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setMainImageFile(file);
              }}
            />
          </label>
        </div>

        {/* GALLERY */}
        <h3 className={styles.subHead}>Gallery Images *</h3>

        <div className={styles.imageUploadContainer}>
          <label className={styles.uploadBox}>
            <div className={styles.uploadText}>
              <p>Upload Gallery Images</p>
              <p>(max 3 images)</p>
            </div>

            <input
              type="file"
              multiple
              hidden
              accept=".jpg,.jpeg,.png"
              onChange={(e) => {
                const files = e.target.files;
                if (!files) return;

                const arr = Array.from(files);

                if (galleryFiles.length + arr.length > 3) {
                  alert("Only 3 images allowed");
                  return;
                }

                setGalleryFiles((prev) => [...prev, ...arr]);
              }}
            />
          </label>

          <div className={styles.galleryPreview}>
            {galleryFiles.map((file, index) => (
              <div key={index} className={styles.galleryItem}>
                <img
                  src={URL.createObjectURL(file)}
                  onClick={() =>
                    setPreview(URL.createObjectURL(file))
                  }
                />
                <button
                  onClick={() =>
                    setGalleryFiles((prev) =>
                      prev.filter((_, i) => i !== index)
                    )
                  }
                >
                  X
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BASIC DETAILS */}
      <div className={styles.basics}>
        <h2 className={styles.bhead}>Basic Details</h2>

        <div className={styles.bde}>
          <div className={styles.bdecard}>
            <p className={styles.bdehead}>Brand</p>
            <input
              className={styles.bdein}
              type="text"
              value="VYLUX"
              readOnly
            />
          </div>

          <div className={styles.bdecard}>
            <p className={styles.bdehead}>Warranty</p>
            <input
              className={styles.bdein}
              type="number"
              min="1"
              value={warranty}
              onChange={(e) => setWarranty(e.target.value)}
              placeholder="Warranty (months)"
            />
          </div>
        </div>
      </div>

      {/* NEXT BUTTON */}
      <button
        className={styles.nextpage}
        onClick={() => {
          if (!productName.trim())
            return alert("Product Name is required");

          if (!modelNumber.trim())
            return alert("Model Number is required");

          if (!categoryId)
            return alert("Category is required");

          if (!mainImageFile)
            return alert("Main Image is required");

          if (!warranty)
            return alert("Warranty is required");

          setPage("specs");
        }}
      >
        Next Page
      </button>
    </div>
  </>
)}
      {/* ================= PAGE 2 FULL ================= */}
    
{page === "specs" && (
  <>
    <div className={styles.basics}>
      <h2 className={styles.bhead}>Technical Specs</h2>

      <div className={styles.bde}>
        <div className={styles.bdecard}>
          <p className={styles.bdehead}>Power Consumption</p>
          <input
            className={styles.bdein}
            type="text"
            value={power}
            onChange={(e) => setPower(e.target.value)}
          />
        </div>

        <div className={styles.bdecard}>
          <p className={styles.bdehead}>Color Temperature</p>
          <input
            className={styles.bdein}
            type="text"
            value={colorTemperature}
            onChange={(e) => setColorTemperature(e.target.value)}
          />
        </div>

        <div className={styles.bdecard}>
          <p className={styles.bdehead}>Rated Voltage</p>
          <input
            className={styles.bdein}
            type="number"
            value={ratedVoltage}
            onChange={(e) => setRatedVoltage(e.target.value)}
          />
        </div>

        <div className={styles.bdecard}>
          <p className={styles.bdehead}>Operating Voltage</p>
          <input
            className={styles.bdein}
            type="number"
            value={operatingVoltage}
            onChange={(e) => setOperatingVoltage(e.target.value)}
          />
        </div>

        <div className={styles.bdecard}>
          <p className={styles.bdehead}>Average Life</p>
          <input
            className={styles.bdein}
            type="number"
            value={averageLife}
            onChange={(e) => setAverageLife(e.target.value)}
          />
        </div>
      </div>

      {/* ================= VARIANTS ================= */}
      <div className={styles.variants}>
        <div className={styles.vhead}>
          <p className={styles.vdhead}>Variants</p>

          <button
            type="button"
            className={styles.vdadd}
            onClick={addVariant}
          >
            + Add Variant
          </button>
        </div>

        {/* INPUT FORM */}
        <div className={styles.vdetails}>
          <div className={styles.vde}>
            <p className={styles.vdename}>Watt</p>
            <input
              className={styles.vdein}
              value={variantWatt}
              onChange={(e) => setVariantWatt(e.target.value)}
              placeholder="Enter watt"
            />
          </div>

          <div className={styles.vde}>
            <p className={styles.vdename}>Price Per Piece</p>
            <input
              className={styles.vdein}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
            />
          </div>
        </div>

        <div className={styles.vdetails}>
          <div className={styles.vde}>
            <p className={styles.vdename}>MOQ (pcs)</p>
            <input
              className={styles.vdein}
              value={moq}
              onChange={(e) => setMoq(e.target.value)}
              placeholder="Enter MOQ"
            />
          </div>

          <div className={styles.vde}>
            <p className={styles.vdename}>Stock (pcs)</p>
            <input
              className={styles.vdein}
              value={stock}
              onChange={(e) => setStock(e.target.value)}
              placeholder="Enter stock"
            />
          </div>
        </div>

        {/* ================= VARIANT LIST ================= */}
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Watt</th>
              <th>Price</th>
              <th>MOQ</th>
              <th>Stock</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {variants.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center" }}>
                  No variants added
                </td>
              </tr>
            ) : (
              variants.map((v) => (
                <tr key={v.id}>
                  <td>{v.watt}</td>
                  <td>₹{v.price}</td>
                  <td>{v.moq}</td>
                  <td>{v.stock}</td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => {
                          setVariantWatt(v.watt);
                          setPrice(v.price);
                          setMoq(v.moq);
                          setStock(v.stock);

                          setVariants((prev) =>
                            prev.filter((x) => x.id !== v.id)
                          );
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className={styles.deleteBtn}
                        onClick={() =>
                          setVariants((prev) =>
                            prev.filter((x) => x.id !== v.id)
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ================= PREVIEW ================= */}
      <div className={styles.preview}>
        <h1 className={styles.phead}>Product View</h1>

        <div className={styles.pimg}>
          <div className={styles.icont}>
            <img
            src={
  mainImageFile
    ? URL.createObjectURL(mainImageFile)
    : "/placeholder.png"
}
              alt="product"
              className={styles.preimg}
            />
          </div>

          <div className={styles.ide}>
            <p className={styles.pimghead}>
              {productName || "Product Name"}
            </p>

            <p className={styles.pimgkey}>
              Model: <span>{modelNumber || "-"}</span>
            </p>

            <p className={styles.pimgkey}>
              Category:{" "}
              <span>
                {categories.find((c) => c.id === categoryId)?.name || "-"}
              </span>
            </p>

            <p className={styles.pimgkey}>
              Brand: <span>VYLUX</span>
            </p>

            <p className={styles.pimgkey}>
              Warranty: <span>{warranty || "-"}</span>
            </p>
          </div>
        </div>
      </div>

      {/* ================= BUTTONS ================= */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          className={styles.nextpage}
          onClick={() => setPage("info")}
        >
          Back
        </button>

        <button
          className={styles.nextpage}
          onClick={handleSave}
        >
          Save Product
        </button>
      </div>
    </div>
  </>
)}

      {/* FULLSCREEN IMAGE */}
     
     {preview && (
  <div
    className={styles.fullScreen}
    onClick={() => setPreview(null)}
  >
    <img
      src={preview}
      alt="preview"
      onClick={(e) => e.stopPropagation()} // prevents accidental close when clicking image
    />
  </div>
)}
    </div>
  );
}