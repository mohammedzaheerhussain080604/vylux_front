"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import styles from "./editproduct.module.css";

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

const API = "https://vylux-front.onrender.com/api/vylux";

export default function EditProduct() {
  const params = useParams();
  const productId = params?.id as string | undefined;
  const isEdit = Boolean(productId);

  const [page, setPage] = useState<"info" | "specs">("info");

  const [productName, setProductName] = useState("");
  const [modelNumber, setModelNumber] = useState("");

  const [category, setCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);

  const [mainImage, setMainImage] = useState("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [preview, setPreview] = useState<string | null>(null);

  const [warranty, setWarranty] = useState("");

  const [power, setPower] = useState("");
  const [colorTemperature, setColorTemperature] = useState("");
  const [ratedVoltage, setRatedVoltage] = useState("");
  const [operatingVoltage, setOperatingVoltage] = useState("");
  const [averageLife, setAverageLife] = useState("");

  const [variants, setVariants] = useState<Variant[]>([]);
  const [variantWatt, setVariantWatt] = useState("");
  const [price, setPrice] = useState("");
  const [moq, setMoq] = useState("");
  const [stock, setStock] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  // =========================
  // 🔐 ADMIN CHECK (NO EXTRA FUNCTION)
  // =========================
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/admin/login";
    }
  }, []);

  // =========================
  // FETCH CATEGORIES (SECURED)
  // =========================
  useEffect(() => {
    const fetchCategories = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/home/categories`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    };

    fetchCategories();
  }, []);

  // =========================
  // FETCH PRODUCT (SECURED)
  // =========================
  useEffect(() => {
    if (!productId) return;

    const fetchProduct = async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API}/products/${productId}`, {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const data = await res.json();

      const product = data.product;

      setProductName(product.name || "");
      setModelNumber(product.model || "");
      setCategory(product.category_id ?? product.category ?? null);

      setPower(product.power_consumption || "");
      setColorTemperature(product.color_temperature || "");
      setRatedVoltage(product.rated_voltage || "");
      setOperatingVoltage(product.operating_voltage || "");
      setAverageLife(product.average_life || "");
      setWarranty(product.warranty || "");

      setMainImage(product.main_image || "");
      setGallery(data.images || []);

      setVariants(
        (data.variants || []).map((v: any) => ({
          id: Number(v.id),
          watt: v.watt,
          price: v.price,
          moq: v.moq,
          stock: v.stock,
        }))
      );
    };

    fetchProduct();
  }, [productId]);

  // =========================
  // IMAGE HANDLERS
  // =========================
  const handleMainImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMainImageFile(file);
    setMainImage(URL.createObjectURL(file));
  };

  const handleGallery = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const arr = Array.from(files);
    const total = [...galleryFiles, ...arr];

    if (total.length > 3) {
      alert("Only 3 images allowed");
      return;
    }

    setGalleryFiles(total);
    setGallery((prev) => [...prev, ...arr.map((f) => URL.createObjectURL(f))]);
  };

  const deleteImage = (index: number) => {
    setGallery((prev) => prev.filter((_, i) => i !== index));
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // =========================
  // VARIANTS
  // =========================
  const addVariant = () => {
    if (!variantWatt || !price) return alert("Watt & Price required");

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

  const editVariant = (id?: number) => {
    if (id === undefined) return;

    const v = variants.find((x) => x.id === id);
    if (!v) return;

    setVariantWatt(v.watt);
    setPrice(v.price);
    setMoq(v.moq);
    setStock(v.stock);

    setVariants((prev) => prev.filter((x) => x.id !== id));
  };

  const deleteVariant = (id?: number) => {
    if (id === undefined) return;

    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  // =========================
  // SAVE (SECURED)
  // =========================
  const handleSave = async () => {
    if (!productId) return alert("Invalid product");

    const token = localStorage.getItem("token");

    const formData = new FormData();

    formData.append("name", productName);
    formData.append("model", modelNumber);
    formData.append("category", String(category));

    formData.append("powerConsumption", power);
    formData.append("colorTemperature", colorTemperature);
    formData.append("ratedVoltage", ratedVoltage);
    formData.append("operatingVoltage", operatingVoltage);
    formData.append("averageLife", averageLife);
    formData.append("warranty", warranty);

    if (mainImageFile) formData.append("mainImage", mainImageFile);

    galleryFiles.forEach((f) => formData.append("galleryImages", f));

    formData.append("variants", JSON.stringify(variants));

    const res = await fetch(`${API}/products/${productId}`, {
      method: "PUT",
      body: formData,
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    const data = await res.json();

    if (res.ok) {
      alert("Product Updated Successfully");
      setPage("info");
    } else {
      alert(data.message || "Update failed");
    }
  };

 


  return (
    <div className={styles.cont}>
  <h1 className={styles.head}>
    EDIT PRODUCTADD PRODUCT"
  </h1>

  {/* ================= PAGE 1 FULL ================= */}
 {page === "info" && (
  <>
    <div className={styles.prodecont}>
      
      {/* HEADER WITH EDIT BUTTON */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 className={styles.phead}>Product Information</h2>

        {productId && (
          <button
            type="button"
            onClick={() => setIsEditing((prev) => !prev)}
            className={styles.editBtn}
            style={{ padding: "6px 12px", fontSize: "14px" }}
          >
            {isEditing ? "Lock" : "Edit"}
          </button>
        )}
      </div>

      {/* PRODUCT NAME */}
      <div className={styles.proname}>
        <p className={styles.lhead}>Product Name *</p>
        <input
          type="text"
          value={productName}
          disabled={productId ? !isEditing : false}
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
              disabled={productId ? !isEditing : false}
              onChange={(e) => setModelNumber(e.target.value)}
              placeholder="Enter Model Number"
              className={styles.pdin}
            />
          </div>

          <div className={styles.field}>
            <p className={styles.lhead}>Category *</p>

            <select
              value={category ?? ""}
              disabled={productId ? !isEditing : false}
              onChange={(e) =>
                setCategory(e.target.value === "" ? null : Number(e.target.value))
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

          {mainImage && (
            <img
              src={mainImage}
              className={styles.uploadPreviewImg}
              onClick={() => setPreview(mainImage)}
              alt="main"
            />
          )}

          {/* disable upload if locked */}
          <input
            type="file"
            hidden
            disabled={productId ? !isEditing : false}
            accept=".jpg,.jpeg,.png"
            onChange={handleMainImage}
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
            disabled={productId ? !isEditing : false}
            accept=".jpg,.jpeg,.png"
            onChange={handleGallery}
          />
        </label>

        <div className={styles.galleryPreview}>
          {gallery.slice(0, 3).map((img, index) => (
            <div key={index} className={styles.galleryItem}>
              <img src={img} alt="gallery" onClick={() => setPreview(img)} />

              {isEditing && (
                <button onClick={() => deleteImage(index)}>X</button>
              )}
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
          <input className={styles.bdein} value="VYLUX" readOnly />
        </div>

        <div className={styles.bdecard}>
          <p className={styles.bdehead}>Warranty</p>
          <input
            className={styles.bdein}
            type="number"
            value={warranty}
            disabled={productId ? !isEditing : false}
            onChange={(e) => setWarranty(e.target.value)}
            placeholder="Warranty"
          />
        </div>

      </div>
    </div>

    {/* NEXT BUTTON */}
    <button
      className={styles.nextpage}
      onClick={() => {
        if (productId && !isEditing) {
          setPage("specs");
          return;
        }

        if (!productName.trim()) return alert("Product Name required");
        if (!modelNumber.trim()) return alert("Model Number required");
        if (category === null) return alert("Category required");
        if (!warranty) return alert("Warranty required");

        setPage("specs");
      }}
    >
      Next Page
    </button>
  </>
)}
      {/* ================= PAGE 2 FULL ================= */}
    
{page === "specs" && (
  <>
    <div className={styles.basics}>
      <h2 className={styles.bhead}>Technical Specs</h2>

      <div className={styles.bde}>

        {/* POWER */}
        <div className={styles.bdecard}>
          <p className={styles.bdehead}>Power Consumption</p>
          <input
            className={styles.bdein}
            type="text"
            value={power}
            disabled={productId ? !isEditing : false}
            onChange={(e) => setPower(e.target.value)}
          />
        </div>

        {/* COLOR TEMP */}
        <div className={styles.bdecard}>
          <p className={styles.bdehead}>Color Temperature</p>
          <input
            className={styles.bdein}
            type="text"
            value={colorTemperature}
            disabled={productId ? !isEditing : false}
            onChange={(e) => setColorTemperature(e.target.value)}
          />
        </div>

        {/* RATED VOLTAGE */}
        <div className={styles.bdecard}>
          <p className={styles.bdehead}>Rated Voltage</p>
          <input
            className={styles.bdein}
            type="number"
            value={ratedVoltage}
            disabled={productId ? !isEditing : false}
            onChange={(e) => setRatedVoltage(e.target.value)}
          />
        </div>

        {/* OPERATING VOLTAGE */}
        <div className={styles.bdecard}>
          <p className={styles.bdehead}>Operating Voltage</p>
          <input
            className={styles.bdein}
            type="number"
            value={operatingVoltage}
            disabled={productId ? !isEditing : false}
            onChange={(e) => setOperatingVoltage(e.target.value)}
          />
        </div>

        {/* AVERAGE LIFE */}
        <div className={styles.bdecard}>
          <p className={styles.bdehead}>Average Life</p>
          <input
            className={styles.bdein}
            type="number"
            value={averageLife}
            disabled={productId ? !isEditing : false}
            onChange={(e) => setAverageLife(e.target.value)}
          />
        </div>

      </div>

      {/* ================= VARIANTS ================= */}
      <div className={styles.variants}>
        <div className={styles.vhead}>
          <p className={styles.vdhead}>Variants</p>

          {(!productId || isEditing) && (
            <button
              type="button"
              className={styles.vdadd}
              onClick={addVariant}
            >
              + Add Variant
            </button>
          )}
        </div>

        {/* INPUT FORM */}
        {(!productId || isEditing) && (
          <>
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
          </>
        )}

        {/* VARIANT LIST */}
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

                      {(!productId || isEditing) && (
                        <button
                          className={styles.editBtn}
                          onClick={() => editVariant(v.id)}
                        >
                          Edit
                        </button>
                      )}

                      {(!productId || isEditing) && (
                        <button
                          className={styles.deleteBtn}
                          onClick={() => deleteVariant(v.id)}
                        >
                          Delete
                        </button>
                      )}

                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PRODUCT PREVIEW */}
      <div className={styles.preview}>
        <h1 className={styles.phead}>Product View</h1>

        <div className={styles.ide}>
          <p className={styles.pimghead}>
            {productName || "Product Name"}
          </p>

          <p className={styles.pimgkey}>
            Model:
            <span className={styles.pimgvalue}>
              {modelNumber || "-"}
            </span>
          </p>

          <p className={styles.pimgkey}>
            Category:
            <span className={styles.pimgvalue}>
              {categories.find((c) => c.id === category)?.name || "-"}
            </span>
          </p>

          <p className={styles.pimgkey}>
            Brand:
            <span className={styles.pimgvalue}>VYLUX</span>
          </p>

          <p className={styles.pimgkey}>
            Warranty:
            <span className={styles.pimgvalue}>
              {warranty || "-"}
            </span>
          </p>
        </div>
      </div>

      {/* NAV BUTTONS */}
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
          {productId ? (isEditing ? "Update Product" : "Lock & Save") : "Save Product"}
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
          <img src={preview} />
        </div>
      )}
    </div>
  );
}