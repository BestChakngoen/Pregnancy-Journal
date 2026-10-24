// แยก auth ออกจาก firebase.ts: หน้าหลักโหลด auth SDK เฉพาะตอนใช้จริง ผ่าน import("@/lib/auth")
import { getAuth, signOut } from "firebase/auth";
import { app } from "@/lib/firebase";

export const auth = getAuth(app);
export const signOutUser = () => signOut(auth);

// Firebase Auth ต้องใช้อีเมล แต่ผู้ใช้ล็อกอินด้วยชื่อ จึงแปลงชื่อ (lowercase) เป็นอีเมลภายใน
// hex เพราะอีเมลรับตัวอักษรไทยไม่ได้ และ local part ยาวได้ไม่เกิน 64 ตัว
export const nameToEmail = (name: string) => {
  const hex = Array.from(new TextEncoder().encode(name.toLowerCase()))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${hex}@momsafe.app`;
};
