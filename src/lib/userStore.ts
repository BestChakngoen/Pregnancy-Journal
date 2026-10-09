// src/lib/userStore.ts
// เราใช้ localStorage เพื่อจำค่าว่าผู้ใช้คนนี้ชื่ออะไร และเคยตั้งค่าเบื้องต้นแล้วหรือยัง
"use client";

import { useEffect, useState } from "react";

export interface UserProfile {
  name: string;
  age: string;
  gestationalWeeks: string;
  gravida: string;
}

export function useUserStore() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // โหลดข้อมูลจาก LocalStorage ตอนเปิดแอป
  useEffect(() => {
    const savedUser = localStorage.getItem("bumply_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse user from local storage");
      }
    }
    setIsLoaded(true);
  }, []);

  const loginOrSaveUser = (profile: UserProfile) => {
    // 1. Save locally
    localStorage.setItem("bumply_user", JSON.stringify(profile));
    setUser(profile);
  };

  const logout = () => {
    localStorage.removeItem("bumply_user");
    setUser(null);
  };

  return { user, isLoaded, loginOrSaveUser, logout };
}
