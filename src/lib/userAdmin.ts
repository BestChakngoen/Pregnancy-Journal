import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, deleteDoc, doc, getDocs, writeBatch } from "firebase/firestore/lite";
import { db } from "@/lib/firebase";
import { adminNameToEmail, auth } from "@/lib/auth";

// ต้องตรงกับ 48 ชม. ใน inviteUsable (firestore.rules) — Rules เป็นตัวบังคับจริง ค่านี้ใช้แสดงเวลาหมดอายุ
export const INVITE_HOURS = 48;

// รหัสเชิญ = hex 32 ตัว (128 บิต) ตรงกับ key.matches ใน firestore.rules
export const newInviteKey = () =>
  Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");

// สมัคร admin ด้วยรหัสเชิญ: สร้างบัญชีโดเมน admin (ล็อกอินค้างในเครื่องนี้) แล้วสร้าง admins/{uid} + ลบรหัสเชิญในชุดเดียว
// รหัสเชิญผิด/หมดอายุ/ถูกใช้แล้ว Rules ปฏิเสธ (permission-denied) → ลบบัญชีที่เพิ่งสร้างทิ้ง ไม่ให้ชื่อถูกจองค้าง
export async function redeemAdminInvite(key: string, name: string, password: string): Promise<string> {
  const { user } = await createUserWithEmailAndPassword(auth, adminNameToEmail(name), password);
  try {
    const batch = writeBatch(db);
    batch.set(doc(db, "admins", user.uid), { name, addedAt: new Date().toISOString(), inviteKey: key });
    batch.delete(doc(db, "invites", key));
    await batch.commit();
  } catch (err) {
    await user.delete().catch(() => {});
    throw err;
  }
  return user.uid;
}

const LOG_COLLECTIONS = ["bloodPressures", "weights", "kicks"];

// ลบ log ย่อยก่อนแล้วค่อยลบโปรไฟล์ — ถ้าพังกลางทาง โปรไฟล์ยังอยู่ในรายชื่อให้ลบซ้ำได้ (ลบโปรไฟล์ก่อนจะเหลือ log ค้างที่หน้า admin มองไม่เห็น)
// ลบได้เฉพาะข้อมูลใน Firestore: บัญชีล็อกอิน (Firebase Auth) ลบจากฝั่ง client ไม่ได้
// shortcut: ลบทีละเอกสารแบบขนาน (writeBatch ชนเพดาน 20 exists() ต่อ request ของ Security Rules), ถ้าบันทึกต่อคนเกินหลักพันให้ย้ายไปลบฝั่งเซิร์ฟเวอร์
export async function deletePatient(uid: string) {
  for (const name of LOG_COLLECTIONS) {
    const snap = await getDocs(collection(db, "users", uid, name));
    await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
  }
  await deleteDoc(doc(db, "users", uid));
}
