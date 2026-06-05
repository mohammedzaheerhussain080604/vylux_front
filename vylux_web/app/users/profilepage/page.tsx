"use client";

import { useEffect, useState } from "react";
import styles from "./profilepage.module.css";

interface ProfileType {
  name: string;
  email: string;
  phone: string;
  alternatePhone: string;
  shopName: string;
  gstin: string;
  address: string;
  pincode: string;
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [profile, setProfile] = useState<ProfileType>({
    name: "",
    email: "",
    phone: "",
    alternatePhone: "",
    shopName: "",
    gstin: "",
    address: "",
    pincode: "",
  });

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("token")
      : null;

  const fetchProfile = async () => {
    try {
      const res = await fetch("https://vylux-front.onrender.com/api/vylux/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setProfile({
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          alternatePhone: data.user.alternate_phone || "",
          shopName: data.user.shop_name || "",
          gstin: data.user.gstin || "",
          address: data.user.address || "",
          pincode: data.user.pincode || "",
        });
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const saveProfile = async () => {
    try {
      const res = await fetch("https://vylux-front.onrender.com/api/vylux/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });

      const data = await res.json();

      if (data.success) {
        setIsEditing(false);
        alert("Profile Updated Successfully");
      }
    } catch (err) {
      console.log(err);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.headerCard}>
        <div className={styles.avatar}>
          {profile.name?.charAt(0)}
        </div>

        <h2>{profile.shopName || "My Shop"}</h2>
        <p>{profile.email}</p>

        <div className={styles.badge}>
          Wholesaler Account
        </div>
      </div>

      {/* PERSONAL */}
      <div className={styles.card}>
        <h3>Personal Information</h3>

        <div className={styles.row}>
          <div className={styles.label}>Name</div>
          <div className={styles.value}>
            <input
              name="name"
              value={profile.name}
              disabled
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.label}>Email</div>
          <div className={styles.value}>
            <input
              name="email"
              value={profile.email}
              disabled
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.label}>Phone</div>
          <div className={styles.value}>
            <input
              name="phone"
              value={profile.phone}
              disabled
              className={styles.input}
            />
          </div>
        </div>
      </div>

      {/* BUSINESS */}
      <div className={styles.card}>
        <h3>Business Information</h3>

        <div className={styles.row}>
          <div className={styles.label}>Shop Name</div>
          <div className={styles.value}>
            <input
              name="shopName"
              value={profile.shopName}
              onChange={handleChange}
              disabled={!isEditing}
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.label}>GSTIN</div>
          <div className={styles.value}>
            <input
              name="gstin"
              value={profile.gstin}
              onChange={handleChange}
              disabled={!isEditing}
              className={styles.input}
            />
          </div>
        </div>
      </div>

      {/* ADDRESS */}
      <div className={styles.card}>
        <h3>Delivery Address</h3>

        <div className={styles.row}>
          <div className={styles.label}>Address</div>
          <div className={styles.value}>
            <textarea
              name="address"
              value={profile.address}
              onChange={handleChange}
              disabled={!isEditing}
              className={styles.textarea}
            />
          </div>
        </div>

        <div className={styles.row}>
          <div className={styles.label}>Pincode</div>
          <div className={styles.value}>
            <input
              name="pincode"
              value={profile.pincode}
              onChange={handleChange}
              disabled={!isEditing}
              className={styles.input}
            />
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className={styles.card}>
        {!isEditing ? (
          <button
            className={styles.primaryBtn}
            onClick={() => setIsEditing(true)}
          >
            Edit Profile
          </button>
        ) : (
          <button
            className={styles.primaryBtn}
            onClick={saveProfile}
          >
            Save Changes
          </button>
        )}

        <button className={styles.secondaryBtn}>
          Change Password
        </button>

        <button className={styles.logoutBtn}>
          Logout
        </button>
      </div>
    </div>
  );
}