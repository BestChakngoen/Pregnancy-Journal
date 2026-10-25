// ซิงค์ข้อมูลจาก Cloud มารวมกับในเครื่อง "ก่อนบันทึก" — กันบันทึก/แก้ทับข้อมูลที่ผู้ใช้เพิ่งบันทึกจากอุปกรณ์อื่น
// ไม่ได้ล็อกอิน / ออฟไลน์ / ไม่มีสิทธิ์ / ช้าเกิน SYNC_TIMEOUT_MS = คืน null แล้วให้ผู้เรียกใช้ข้อมูลในเครื่องต่อ (การบันทึกไม่ถูกบล็อก)
import { doc, getDoc } from "firebase/firestore/lite";
import { db, currentUid } from "@/lib/firebase";
import { dayKey, fetchRecent } from "@/lib/healthLogs";
import { mergeCloudHealth } from "@/lib/mergeHealth";
import type { TrackingData } from "@/lib/trackingStore";
import type { UserProfile } from "@/lib/userStore";

const SYNC_TIMEOUT_MS = 3000;

const orNull = <T,>(task: Promise<T | null>) =>
  Promise.race([task, new Promise<null>((resolve) => setTimeout(() => resolve(null), SYNC_TIMEOUT_MS))]).catch(() => null);

// รายการล่าสุดของความดัน/น้ำหนัก และลูกดิ้นวันนี้ → รวมเข้ากับข้อมูลในเครื่อง
export const pullHealth = (local: TrackingData, keepKicks: boolean) =>
  orNull(
    (async () => {
      const [bp, weight, kick] = await Promise.all([
        fetchRecent<{ id: string; systolic: number; diastolic: number; timestamp: string }>("bloodPressures", "timestamp", 1),
        fetchRecent<{ id: string; kg: number; timestamp: string }>("weights", "timestamp", 1),
        fetchRecent<{ date: string; count: number }>("kicks", "date", 1),
      ]);
      return mergeCloudHealth(local, { bp: bp[0], weight: weight[0], kick: kick[0] }, dayKey(), keepKicks);
    })()
  );

const PROFILE_FIELDS = ["name", "age", "gestationalWeeks", "gravida", "expectedDeliveryDate"] as const;

// โปรไฟล์ล่าสุดบน Cloud (เฉพาะช่องที่แอปใช้)
export const pullProfile = () =>
  orNull(
    (async () => {
      const uid = await currentUid();
      if (!uid) return null;
      const snap = await getDoc(doc(db, "users", uid));
      if (!snap.exists()) return null;
      const data = snap.data();
      const profile: Partial<UserProfile> = {};
      for (const f of PROFILE_FIELDS) if (typeof data[f] === "string") profile[f] = data[f];
      return profile;
    })()
  );
