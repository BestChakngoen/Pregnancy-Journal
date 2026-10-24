// บันทึกสุขภาพบน Firestore: users/{uid}/bloodPressures, /weights, /kicks/{YYYY-MM-DD}
// ใช้ทั้งตอนบันทึก (หน้าหลัก) และหน้าประวัติสุขภาพ — หน้า admin อ่านผ่าน collection group
import { addDoc, collection, doc, getDocs, increment, limit, orderBy, query, setDoc } from "firebase/firestore/lite";
import { db, currentUid } from "@/lib/firebase";

// event ให้หน้าประวัติสุขภาพโหลดใหม่หลังบันทึก (อยู่หน้าเดียวกัน)
export const HEALTH_LOGGED = "health-logged";

// เกณฑ์ความดันสูงขณะตั้งครรภ์ — ใช้ทั้งตอนบันทึก, เตือนผู้ใช้ และหน้า admin (firestore.rules ตรวจเกณฑ์เดียวกัน)
export const isHighBP = (systolic: number, diastolic: number) => systolic >= 140 || diastolic >= 90;

// วันที่ตามเวลาเครื่อง (ใช้เป็น id เอกสารลูกดิ้นรายวัน)
export const dayKey = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

async function myCollection(name: "bloodPressures" | "weights" | "kicks") {
  const uid = await currentUid();
  if (!uid) throw new Error("not signed in");
  return collection(db, "users", uid, name);
}

const notify = () => window.dispatchEvent(new Event(HEALTH_LOGGED));

// id = แก้รายการเดิมที่บันทึกผิด (เวลาเดิม) / ไม่มี id = บันทึกครั้งใหม่ — คืน id ของรายการ
async function saveLog(name: "bloodPressures" | "weights", data: Record<string, unknown>, id?: string) {
  const col = await myCollection(name);
  if (id) await setDoc(doc(col, id), data);
  else id = (await addDoc(col, data)).id;
  notify();
  return id;
}

export const saveBloodPressure = (systolic: number, diastolic: number, timestamp: string, id?: string) =>
  saveLog("bloodPressures", { systolic, diastolic, timestamp, isHighRisk: isHighBP(systolic, diastolic) }, id);

export const saveWeight = (kg: number, timestamp: string, id?: string) => saveLog("weights", { kg, timestamp }, id);

// increment ฝั่งเซิร์ฟเวอร์: กดรัวๆ แล้วคำขอถึงไม่ตามลำดับ ยอดก็ยังถูก
export async function addKicks(delta: 1 | -1) {
  const today = dayKey();
  const col = await myCollection("kicks");
  await setDoc(doc(col, today), { count: increment(delta), date: today, updatedAt: new Date().toISOString() }, { merge: true });
  notify();
}

// n รายการล่าสุด เรียงเก่า → ใหม่ (สำหรับกราฟ)
export async function fetchRecent<T>(name: "bloodPressures" | "weights" | "kicks", field: string, n: number) {
  const snap = await getDocs(query(await myCollection(name), orderBy(field, "desc"), limit(n)));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T).reverse();
}
