"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

import SplashImage from "../public/splash_screen/splash_screen.jpeg";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      const token = localStorage.getItem("token");
      const user = localStorage.getItem("user");

      if (!token || !user) {
        router.replace("/auth/login");
        return;
      }

      const role = JSON.parse(user).role;

      if (role === "admin") {
        router.replace("/admin/homepage");
      } else {
        router.replace("/users/homepage");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <Image
        src={SplashImage}
        alt="Splash Screen"
        fill
        priority
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}