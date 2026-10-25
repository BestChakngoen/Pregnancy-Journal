// บันทึกผลแบบประเมิน/แบบทดสอบ: เก็บ "ครั้งล่าสุด" (ฟิลด์เดิม) และ "ครั้งแรก" (<ฟิลด์>First เขียนครั้งเดียว) — ดู firstResult.ts
import { doc, getDoc, setDoc } from "firebase/firestore/lite";
import { db, currentUid } from "@/lib/firebase";
import { withFirst, type ResultField } from "@/lib/firstResult";

const READ_TIMEOUT_MS = 8000;

// อ่านโปรไฟล์จาก Cloud ก่อนเขียนเสมอ (Hydration Lock): อ่านไม่ได้/ช้าเกินกำหนด = throw แล้วไม่เขียนอะไร
// (ผู้เรียกยังแสดงผลให้ผู้ใช้ตามปกติ แต่ผลครั้งนี้จะไม่ถูกเก็บ — กันกำหนด "ครั้งแรก" ผิด)
export async function saveResult(field: ResultField, result: unknown) {
  const uid = await currentUid();
  if (!uid) throw new Error("not signed in");
  const ref = doc(db, "users", uid);
  const snap = await Promise.race([
    getDoc(ref),
    new Promise<never>((_, reject) => setTimeout(() => reject(new Error("read timeout")), READ_TIMEOUT_MS)),
  ]);
  await setDoc(ref, withFirst(snap.data(), field, result), { merge: true });
}
