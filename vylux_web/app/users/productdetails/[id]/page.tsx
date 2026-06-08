"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./productdetails.module.css";
import Image from "next/image";
import { useParams } from "next/navigation";

export default function ProductDetails() {
  const { id } = useParams();

  const [product, setProduct] = useState<any>(null);
  const [images, setImages] = useState<any[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);

  const [activeDot, setActiveDot] = useState(0);

  const [qty, setQty] = useState<number>(1);
  const [qtyInput, setQtyInput] = useState<string>("1");

  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(
          `https://vylux-front.onrender.com/api/vylux/products/${id}`
        );

        const data = await res.json();
        const p = data.product;

        setProduct(p);

        setImages(
          p?.main_image
            ? [p.main_image, ...(data.images || [])]
            : data.images || []
        );

        setVariants(data.variants || []);

        const firstVariant = data.variants?.[0] || null;
        setSelectedVariant(firstVariant);

        const moq = Number(firstVariant?.moq || 1);

        setQty(moq);
        setQtyInput(String(moq));
      } catch (err) {
        console.error(err);
      }
    };

    if (id) fetchProduct();
  }, [id]);

  const moq = Number(selectedVariant?.moq || 1);

  const handleScroll = () => {
    if (!sliderRef.current) return;

    const scrollLeft = sliderRef.current.scrollLeft;
    const width = sliderRef.current.clientWidth;

    setActiveDot(Math.round(scrollLeft / width));
  };

  const handleDotClick = (index: number) => {
    if (!sliderRef.current) return;

    sliderRef.current.scrollTo({
      left: index * sliderRef.current.clientWidth,
      behavior: "smooth",
    });

    setActiveDot(index);
  };

  const selectVariant = (v: any) => {
    setSelectedVariant(v);

    const newMoq = Number(v?.moq || 1);
    setQty(newMoq);
    setQtyInput(String(newMoq));
  };

  const increaseQty = () => {
    const newQty = qty + moq;
    setQty(newQty);
    setQtyInput(String(newQty));
  };

  const decreaseQty = () => {
    const newQty = Math.max(qty - moq, moq);
    setQty(newQty);
    setQtyInput(String(newQty));
  };

  const handleQtyInput = (val: string) => {
    if (val === "") {
      setQtyInput("");
      return;
    }

    if (!/^\d+$/.test(val)) return;

    setQtyInput(val);

    const num = Number(val);

    if (num >= moq) {
      setQty(num);
    }
  };

  const handleBlur = () => {
    let finalQty = Number(qtyInput);

    if (!finalQty || finalQty < moq) finalQty = moq;

    setQty(finalQty);
    setQtyInput(String(finalQty));
  };

  const price = Number(selectedVariant?.price || 0);
  const total = price * qty;

  const wattBadge = selectedVariant?.watt
    ? `${selectedVariant.watt}W`
    : "N/A";

  const warrantyText = product?.warranty
    ? `${product.warranty} Months`
    : "12 Months";

  if (!product) return <p>Loading...</p>;

  /* ================= FIXED ADD TO CART ================= */
  const handleAddToCart = async () => {
    if (!selectedVariant) return;

    if (qty < moq) {
      alert(`Minimum order quantity is ${moq} pcs`);
      return;
    }

    const token = localStorage.getItem("token"); // 🔥 FIX ADDED

    const cartItem = {
      product_id: product.id,
      variant_id: selectedVariant.id,
      quantity: qty,
    };

    try {
      const res = await fetch(
        "https://vylux-front.onrender.com/api/vylux/cart/add",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // 🔥 FIX ADDED
          },
          body: JSON.stringify(cartItem),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        console.log(errText);
        throw new Error("Failed to add to cart");
      }

      alert("Added to cart successfully");
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    }
  };

  return (
    <div className={styles.cont}>
      <div className={styles.prode}>
        <div className={styles.proimgcont}>
          <div
            className={styles.imageSlider}
            ref={sliderRef}
            onScroll={handleScroll}
          >
            {images.map((img: string, i: number) => (
              <div key={i} className={styles.slide}>
                {img && (
                  <Image
                    src={img}
                    alt="product"
                    width={500}
                    height={500}
                    className={styles.proimg}
                  />
                )}
              </div>
            ))}
          </div>

          <div className={styles.dotsContainer}>
            {images.map((_, i) => (
              <span
                key={i}
                onClick={() => handleDotClick(i)}
                className={`${styles.dot} ${
                  activeDot === i ? styles.activeDot : ""
                }`}
              />
            ))}
          </div>

          <h2 className={styles.badge}>{wattBadge}</h2>
        </div>

        <div className={styles.proimgde}>
          <h2 className={styles.title}>{product.name}</h2>

          <div className={styles.prodemain}>
            <div className={styles.prodeeach}>
              <span className={styles.label}>Model</span>
              <span className={styles.colon}>:</span>
              <span className={styles.value}>{product.model}</span>
            </div>

            <div className={styles.prodeeach}>
              <span className={styles.label}>Category</span>
              <span className={styles.colon}>:</span>
              <span className={styles.value}>
                {product.category_name}
              </span>
            </div>

            <div className={styles.prodeeach}>
              <span className={styles.label}>Warranty</span>
              <span className={styles.colon}>:</span>
              <span className={styles.value}>{warrantyText}</span>
            </div>
          </div>
        </div>

        <div className={styles.watt}>
          <h2 className={styles.whead}>Select Watt</h2>

          <div className={styles.wcard}>
            {variants.map((v: any) => (
              <h4
                key={v.id}
                onClick={() => selectVariant(v)}
                className={styles.wctext}
                style={{
                  background:
                    selectedVariant?.id === v.id ? "#000" : "",
                  color:
                    selectedVariant?.id === v.id ? "#fff" : "",
                  cursor: "pointer",
                }}
              >
                {v.watt}W
              </h4>
            ))}
          </div>
        </div>

        <div className={styles.pricecont}>
          <div className={styles.deprice}>
            <h2 className={styles.depricehead}>Dealer Price</h2>

            <h2 className={styles.pcs}>
              <span className={styles.price}>₹{price}</span>/piece
            </h2>

            <h4 className={styles.moq}>MOQ : {moq} pcs</h4>
          </div>

          <div className={styles.qnty}>
            <h2 className={styles.qhead}>Quantity</h2>

            <div className={styles.qtyBox}>
              <button className={styles.qtyBtn} onClick={decreaseQty}>
                -
              </button>

              <input
                className={styles.qtyValue}
                value={qtyInput}
                onChange={(e) =>
                  handleQtyInput(e.target.value)
                }
                onBlur={handleBlur}
                inputMode="numeric"
              />

              <button className={styles.qtyBtn} onClick={increaseQty}>
                +
              </button>
            </div>

            <p className={styles.minqty}>
              Minimum order quantity is{" "}
              <span className={styles.value}>{moq}</span> pcs
            </p>

            <div className={styles.esti}>
              <p className={styles.estihead}>Estimated Total</p>

              <div className={styles.estide}>
                <p className={styles.estiprice}>₹{total}</p>
                <p className={styles.estitext}>(Excl. GST)</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={styles.bottomInfo}>
          <p className={styles.btotal}>
            Total <span className={styles.pcs}>({qty} pcs)</span>
          </p>

          <p className={styles.bottomPrice}>₹{total}</p>
        </div>

        <div className={styles.bottomBtns}>
          <button
            className={styles.addCart}
            onClick={handleAddToCart}
          >
            Add to Cart
          </button>

          <button
            className={styles.whatsapp}
            onClick={() => {
              const message = `Hello, I want a quotation.

Product: ${product.name}
Model: ${product.model}
Variant: ${selectedVariant?.watt}W
Warranty: ${warrantyText}
Quantity: ${qty}
Total: ₹${total}`;

              window.open(
                `https://wa.me/917358433622?text=${encodeURIComponent(
                  message
                )}`,
                "_blank"
              );
            }}
          >
            Request Quote on WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}