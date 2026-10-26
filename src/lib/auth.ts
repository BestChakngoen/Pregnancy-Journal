// แยก auth ออกจาก firebase.ts: หน้าหลักโหลด auth SDK เฉพาะตอนใช้จริง ผ่าน import("@/lib/auth")
import { deleteApp, initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, inMemoryPersistence, initializeAuth, signOut, updateProfile } from "firebase/auth";
import { app } from "@/lib/firebase";

export const auth = getAuth(app);
export const signOutUser = () => signOut(auth);

// ชื่อผู้ใช้ยาวได้ไม่เกิน 30 ไบต์ (อังกฤษ 30 ตัว / ไทย 10 ตัว) — แปลงเป็นอีเมลแล้วต้องไม่เกิน 64 ตัวของ local part
export const MAX_NAME_BYTES = 30;

// Firebase Auth ต้องใช้อีเมล แต่ผู้ใช้ล็อกอินด้วยชื่อ จึงแปลงชื่อ (lowercase) เป็นอีเมลภายใน
// hex เพราะอีเมลรับตัวอักษรไทยไม่ได้ และ local part ยาวได้ไม่เกิน 64 ตัว
export const nameToEmail = (name: string) => {
  const hex = Array.from(new TextEncoder().encode(name.toLowerCase()))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${hex}@momsafe.app`;
};

// สร้างบัญชีผ่าน Firebase app ตัวที่สอง (เก็บ session ในหน่วยความจำ) เพราะ createUser บน app หลัก
// จะสลับ session ไปเป็นบัญชีใหม่ ทำให้ admin ที่กำลังล็อกอินอยู่หลุดออก — คืน uid ของบัญชีที่สร้าง
export async function createAccount(name: string, password: string): Promise<string> {
  const second = initializeApp(app.options, `create-account-${Date.now()}`);
  try {
    const secondAuth = initializeAuth(second, { persistence: inMemoryPersistence });
    const { user } = await createUserWithEmailAndPassword(secondAuth, nameToEmail(name), password);
    await updateProfile(user, { displayName: name });
    return user.uid;
  } finally {
    await deleteApp(second);
  }
}

export const authErrorMessage = (code: string) => {
  switch (code) {
    case "auth/email-already-in-use":
      return "ชื่อนี้ถูกใช้แล้ว กรุณาเลือกชื่ออื่น หรือเข้าสู่ระบบ";
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "ชื่อหรือรหัสผ่านไม่ถูกต้อง";
    case "auth/weak-password":
      return "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร";
    case "auth/password-does-not-meet-requirements":
      return "รหัสผ่านไม่ผ่านเงื่อนไขความปลอดภัย กรุณาตั้งให้ยาวขึ้นและผสมตัวอักษรกับตัวเลข";
    case "auth/too-many-requests":
      return "ลองหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่";
    case "auth/network-request-failed":
      return "ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้";
    case "auth/operation-not-allowed":
      return "ระบบยังไม่เปิดใช้การเข้าสู่ระบบด้วยรหัสผ่าน (ผู้ดูแลต้องเปิดใน Firebase Console)";
    default:
      return "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
  }
};
