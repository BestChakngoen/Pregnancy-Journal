import { collection, deleteDoc, doc, getDocs } from "firebase/firestore/lite";
import { db } from "@/lib/firebase";

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
