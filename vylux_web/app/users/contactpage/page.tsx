"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import styles from "./contactpage.module.css";

import {
  Phone,
  Mail,
  MapPin,
  MessageCircle,
  Headset,
  ChevronRight,
  Clock3,
} from "lucide-react";

interface ContactSettings {
  banner_image: string;
  phone_number: string;
  whatsapp_number: string;
  email: string;
  address: string;
  map_url: string;
  working_days: string;
  opening_time: string;
  closing_time: string;
}

export default function ContactPage() {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [data, setData] = useState<ContactSettings | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    requirement: "",
  });

  const MAP_URL =
    data?.map_url || "https://maps.app.goo.gl/6VVjGpATQK5VhqWN9";

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get(
        `${API_URL}/api/vylux/contact/settings`
      );

      setData(res.data?.data || null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async () => {
    try {
      await axios.post(
        `${API_URL}/api/vylux/contact/callback`,
        formData
      );

      alert("Callback request submitted!");

      setFormData({
        name: "",
        company: "",
        phone: "",
        requirement: "",
      });
    } catch (err) {
      console.error(err);
      alert("Failed to submit request");
    }
  };

  return (
    <main className={styles.container}>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <Image
            src={
              data?.banner_image ||
              "/banners/contactpage/contactbaneer.jpeg"
            }
            alt="Contact Banner"
            width={1200}
            height={400}
            className={styles.heroImage}
          />
        </div>

        <div className={styles.actionButtons}>
          <a
  href={`https://wa.me/${data?.whatsapp_number || "919876543210"}?text=${encodeURIComponent(
    "Hi VYLUX Lighting, I need help with your products. Can you assist me?"
  )}`}
  target="_blank"
  className={styles.whatsappBtn}
>
  <MessageCircle size={22} />
  WhatsApp Us
</a>

          <a
  href={`tel:${data?.phone_number || "9790051137"}`}
  className={styles.callBtn}
>
  <Phone size={22} />
  Call Us
</a>

        </div>
      </section>

      {/* QUICK CONTACT */}
      <section className={styles.section}>
        <h2>Quick Contact</h2>

        <a
          href={`tel:${data?.phone_number}`}
          className={styles.card}
        >
          <div className={styles.iconCircle}>
            <Phone size={20} />
          </div>

          <div className={styles.cardInfo}>
            <h4>Call Us</h4>
            <p>{data?.phone_number}</p>
          </div>

          <ChevronRight size={18} />
        </a>

        <a
          href={`https://wa.me/${data?.whatsapp_number}`}
          target="_blank"
          className={styles.card}
        >
          <div className={styles.iconCircle}>
            <MessageCircle size={20} />
          </div>

          <div className={styles.cardInfo}>
            <h4>WhatsApp Orders</h4>
            <p>{data?.whatsapp_number}</p>
          </div>

          <ChevronRight size={18} />
        </a>

        <a
          href={`mailto:${data?.email}`}
          className={styles.card}
        >
          <div className={styles.iconCircle}>
            <Mail size={20} />
          </div>

          <div className={styles.cardInfo}>
            <h4>Email Us</h4>
            <p>{data?.email}</p>
          </div>

          <ChevronRight size={18} />
        </a>

        <a
          href={MAP_URL}
          target="_blank"
          className={styles.card}
        >
          <div className={styles.iconCircle}>
            <MapPin size={20} />
          </div>

          <div className={styles.cardInfo}>
            <h4>Office & Warehouse</h4>
            <p>{data?.address}</p>
          </div>

          <ChevronRight size={18} />
        </a>
      </section>

      {/* BUSINESS HOURS */}
      <section className={styles.section}>
        <h2>Business Hours</h2>

        <div className={styles.card}>
          <div className={styles.iconCircle}>
            <Clock3 size={20} />
          </div>

          <div className={styles.cardInfo}>
            <h4>Working Hours</h4>
            <p>
              {data?.working_days} : {data?.opening_time} -{" "}
              {data?.closing_time}
            </p>
          </div>
        </div>
      </section>

      {/* FORM */}
      <section className={styles.formBox}>
        <h3>Request a Callback</h3>

        <div className={styles.formGrid}>
          <input
            name="name"
            placeholder="Your Name"
            value={formData.name}
            onChange={handleChange}
          />

          <input
            name="company"
            placeholder="Company / Shop Name"
            value={formData.company}
            onChange={handleChange}
          />

          <input
            name="phone"
            placeholder="Phone Number"
            value={formData.phone}
            onChange={handleChange}
          />

          <input
            name="requirement"
            placeholder="Your Requirement"
            value={formData.requirement}
            onChange={handleChange}
          />
        </div>

        <button
          className={styles.requestBtn}
          onClick={handleSubmit}
        >
          <Headset size={20} />
          Request Callback
        </button>
      </section>
    </main>
  );
}