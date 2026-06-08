"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import styles from "./contactpage.module.css";
import { useRouter } from "next/navigation";

import {
  Phone,
  Mail,
  MapPin,
  Clock3,
  Upload,
  Save,
  Calendar,
  MessageSquare,
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
  gst_number: string;
  closing_time: string;
}

interface CallbackRequest {
  id: number;
  name: string;
  company: string;
  phone: string;
  requirement: string;
  status: string;
  created_at: string;
}

const getToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export default function ContactAdminPage() {
  const API_URL =
    process.env.NEXT_PUBLIC_API_URL || "https://vylux-front.onrender.com";

  const [settings, setSettings] = useState<ContactSettings>({
    banner_image: "",
    phone_number: "",
    whatsapp_number: "",
    email: "",
    address: "",
    map_url: "",
    working_days: "Monday - Saturday",
    opening_time: "09:00 AM",
    gst_number: "",
    closing_time: "06:00 PM",
  });
  
  const router = useRouter();

const [authorized, setAuthorized] = useState(false);
const [checkingAuth, setCheckingAuth] = useState(true);

useEffect(() => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "admin") {
    router.replace("/admin/login");
    return;
  }

  setAuthorized(true);
  setCheckingAuth(false);
}, [router]);


  const [bannerFile, setBannerFile] = useState<File | null>(null);

  const [requests, setRequests] = useState<CallbackRequest[]>([]);

  const [loading, setLoading] = useState(false);

  

useEffect(() => {
  if (!authorized) return;

  fetchSettings();
  fetchRequests();
}, [authorized]);

  const validateBanner = () => {
  if (!bannerFile && !settings.banner_image) {
    alert("Please select a banner image");
    return false;
  }
  return true;
};



const validateContactDetails = () => {
  if (!settings.phone_number.trim()) {
    alert("Please enter Phone Number");
    return false;
  }

 const gst = Number(settings.gst_number);

  if (isNaN(gst)) {
    alert("GST must be a number");
    return false;
  }

  if (gst < 1 || gst > 100) {
    alert("GST must be between 10% and 100%");
    return false;
  }

  if (!settings.whatsapp_number.trim()) {
    alert("Please enter WhatsApp Number");
    return false;
  }

  if (!settings.email.trim()) {
    alert("Please enter Email Address");
    return false;
  }

  if (!settings.address.trim()) {
    alert("Please enter Office Address");
    return false;
  }

  if (!settings.map_url.trim()) {
    alert("Please enter Google Map URL");
    return false;
  }

  return true;
};

const validateBusinessHours = () => {
  if (!settings.working_days.trim()) {
    alert("Please select Working Days");
    return false;
  }

  if (!settings.opening_time.trim()) {
    alert("Please enter Opening Time");
    return false;
  }

  if (!settings.closing_time.trim()) {
    alert("Please enter Closing Time");
    return false;
  }

  return true;
};

  const fetchSettings = async () => {
    try {
     const res = await axios.get(
      `${API_URL}/api/vylux/contact/settings`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

      if (res.data?.data) {
        setSettings(res.data.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const fetchRequests = async () => {
    try {
       const res = await axios.get(
      `${API_URL}/api/vylux/contact/callback`,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

      setRequests(res.data?.data || []);
    } catch (error) {
      console.error(error);
    }
  };

 const saveSettings = async () => {
  try {
    setLoading(true);

    const formData = new FormData();

    if (bannerFile) {
      formData.append("banner", bannerFile);
    }

    formData.append("phone_number", settings.phone_number);
    formData.append("whatsapp_number", settings.whatsapp_number);
    formData.append("email", settings.email);
    formData.append("address", settings.address);
    formData.append("map_url", settings.map_url);
    formData.append("working_days", settings.working_days);
    formData.append("opening_time", settings.opening_time);
    formData.append("gst_number", settings.gst_number);
    formData.append("closing_time", settings.closing_time);

    await axios.post(
      `${API_URL}/api/vylux/contact/settings`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    alert("Contact settings saved");
    fetchSettings();
  } catch (error) {
    console.error(error);
    alert("Failed to save settings");
  } finally {
    setLoading(false);
  }
};

  const updateStatus = async (
    id: number,
    status: string
  ) => {
    try {
      
       await axios.put(
      `${API_URL}/api/vylux/contact/callback/${id}`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

      fetchRequests();
    } catch (error) {
      console.error(error);
    }
  };

  const [bannerPreview, setBannerPreview] = useState<string | null>(null);

  return (
    <div className={styles.container}>
      {/* Banner Section */}
      <section className={styles.card}>
        <h2>Contact Banner</h2>

        <label className={styles.label}>
          Banner Preview
        </label>

        <div className={styles.bannerPreview}>
          

          <img
  src={
    bannerPreview ||
    settings.banner_image ||
    "/images/contact-banner.png"
  }
  alt="banner"
/>
        </div>

       

       <input
  type="file"
  className={styles.fileInput}
  accept="image/*"
  onChange={(e) => {
    const file = e.target.files?.[0] || null;

    setBannerFile(file);

    if (file) {
      setBannerPreview(URL.createObjectURL(file));
    }
  }}
/>

        <p className={styles.note}>
          Recommended size: 1200 × 400px
        </p>

        <button
          className={styles.greenBtn}
         onClick={async () => {
  if (!validateBanner()) return;

  await saveSettings();

  setBannerFile(null);
  setBannerPreview(null);
}}
        >
          <Upload size={18} />
          {loading
            ? "Uploading..."
            : "Update Banner"}
        </button>
      </section>

      {/* Contact Details */}
      <section className={styles.card}>
        <h2>Quick Contact</h2>

        <label>Phone Number</label>
        <div className={styles.inputGroup}>
          <Phone />
          <input
            value={settings.phone_number}
            onChange={(e) =>
              setSettings({
                ...settings,
                phone_number: e.target.value,
              })
            }
          />
        </div>

        <label>WhatsApp Number</label>
        <div className={styles.inputGroup}>
          <MessageSquare />
          <input
            value={settings.whatsapp_number}
            onChange={(e) =>
              setSettings({
                ...settings,
                whatsapp_number: e.target.value,
              })
            }
          />
        </div>

        <label>Email Address</label>
        <div className={styles.inputGroup}>
          <Mail />
          <input
            value={settings.email}
            onChange={(e) =>
              setSettings({
                ...settings,
                email: e.target.value,
              })
            }
          />
        </div>

        <label>GST %</label>

<div className={styles.inputGroup}>
  <input
  type="number"
  min={10}
  max={100}
  placeholder="Enter GST % (10–100)"
  value={settings.gst_number}
  onChange={(e) =>
    setSettings({
      ...settings,
      gst_number: e.target.value,
    })
  }
/>
</div>

        <label>Office Address</label>
        <div className={styles.inputGroup}>
          <MapPin />
          <input
            value={settings.address}
            onChange={(e) =>
              setSettings({
                ...settings,
                address: e.target.value,
              })
            }
          />
        </div>

        <label>Google Map URL</label>
        <div className={styles.inputGroup}>
          <MapPin />
          <input
            value={settings.map_url}
            onChange={(e) =>
              setSettings({
                ...settings,
                map_url: e.target.value,
              })
            }
          />
        </div>

        <button
          className={styles.greenBtn}
         onClick={async () => {
  if (!validateContactDetails()) return;

  await saveSettings();

  setSettings((prev) => ({
    ...prev,
    phone_number: "",
    whatsapp_number: "",
    email: "",
    address: "",
    map_url: "",
  }));
}}
        >
          <Save size={18} />
          Save Contact Details
        </button>
      </section>

      {/* Business Hours */}
      <section className={styles.card}>
        <h2>Business Hours</h2>

        <label>Working Days</label>

        <div className={styles.inputGroup}>
          <Calendar />

          <select
            value={settings.working_days}
            onChange={(e) =>
              setSettings({
                ...settings,
                working_days: e.target.value,
              })
            }
          >
            <option>Monday - Saturday</option>
            <option>Monday - Friday</option>
          </select>
        </div>

        <label>Opening Time</label>

        <div className={styles.inputGroup}>
          <Clock3 />

          <input
            value={settings.opening_time}
            onChange={(e) =>
              setSettings({
                ...settings,
                opening_time: e.target.value,
              })
            }
          />
        </div>

        <label>Closing Time</label>

        <div className={styles.inputGroup}>
          <Clock3 />

          <input
            value={settings.closing_time}
            onChange={(e) =>
              setSettings({
                ...settings,
                closing_time: e.target.value,
              })
            }
          />
        </div>

        <button
          className={styles.greenBtn}
          onClick={async () => {
  if (!validateBusinessHours()) return;

  await saveSettings();

  setSettings((prev) => ({
    ...prev,
    working_days: "",
    opening_time: "",
    closing_time: "",
  }));
}}
        >
          <Save size={18} />
          Save Hours
        </button>
      </section>

      {/* Callback Requests */}
      <section className={styles.card}>
        <h2>Callback Requests</h2>

        <p className={styles.subTitle}>
          Customer callback requests
        </p>

        {requests.length === 0 && (
          <p>No requests found</p>
        )}

        {requests.map((item) => (
          <div
            className={styles.requestCard}
            key={item.id}
          >
            <div className={styles.avatar}>
              {item.name?.charAt(0)}
            </div>

            <div className={styles.requestInfo}>
              <div className={styles.topRow}>
                <h4>{item.name}</h4>

                <select
                  value={item.status}
                  onChange={(e) =>
                    updateStatus(
                      item.id,
                      e.target.value
                    )
                  }
                >
                  <option>New</option>
                  <option>In Progress</option>
                  <option>Completed</option>
                </select>
              </div>

              <p>{item.company}</p>
              <p>{item.phone}</p>
              <p>{item.requirement}</p>

              <p>
                {new Date(
                  item.created_at
                ).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}