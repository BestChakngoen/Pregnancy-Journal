// รวมค่าล่าสุดจาก Cloud เข้ากับข้อมูลสุขภาพในเครื่อง — ฟังก์ชันล้วน (ไม่มี Firebase/React) จึงทดสอบด้วย node ได้
import type { TrackingData } from "@/lib/trackingStore";

export interface CloudLatest {
  bp?: { id: string; systolic: number; diastolic: number; timestamp: string };
  weight?: { id: string; kg: number; timestamp: string };
  kick?: { date: string; count: number };
}

const pad = (n: number) => String(n).padStart(2, "0");

// เหมือน timeLabel ใน trackingStore แต่รับเวลาที่บันทึกจริง (รายการจาก Cloud อาจไม่ใช่วันนี้)
export const labelOf = (iso: string, now = new Date()) => {
  const d = new Date(iso);
  const hm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  return d.toDateString() === now.toDateString() ? `วันนี้ ${hm}` : `${d.getDate()}/${d.getMonth() + 1} ${hm}`;
};

// แก้ค่าล่าสุด (isEdit) จะเขียนทับรายการเดิมบน Cloud ได้ก็ต่อเมื่อ "ซิงค์สำเร็จ" และรายการล่าสุดยังเป็นรายการที่ผู้ใช้เห็นตอนกดแก้
// ไม่เช่นนั้นให้บันทึกเป็นรายการใหม่แทน ไม่ทับ (Hydration Lock: ไม่เขียนทับข้อมูลบน Cloud ที่ยังไม่ได้อ่านล่าสุด) — reason ไว้แจ้งผู้ใช้
export interface EditDecision {
  edit: boolean;
  reason?: "offline" | "newer";
}
export function resolveEdit(isEdit: boolean, synced: boolean, seenAt: string | undefined, latestAt: string | undefined): EditDecision {
  if (!isEdit) return { edit: false };
  if (!synced) return { edit: false, reason: "offline" };
  return latestAt === seenAt ? { edit: true } : { edit: false, reason: "newer" };
}

// ความดัน/น้ำหนัก: ใหม่กว่าชนะ — รายการจาก Cloud ที่เวลา >= ในเครื่องจึงจะแทน (เท่ากัน = รายการเดียวกันที่อาจถูกแก้จากอุปกรณ์อื่น,
//   น้อยกว่า = ในเครื่องมีรายการใหม่ที่ยังส่งขึ้นไม่สำเร็จ ต้องเก็บไว้)
// ลูกดิ้น: Cloud เป็นตัวนับกลาง (increment ฝั่งเซิร์ฟเวอร์) แต่ keepKicks = ยังมีการนับจากเครื่องนี้ค้างส่ง ห้ามให้ค่าถอยกลับ
export function mergeCloudHealth(local: TrackingData, cloud: CloudLatest, today: string, keepKicks: boolean, now = new Date()): TrackingData {
  const next = { ...local };
  const { bp, weight, kick } = cloud;
  if (bp && bp.timestamp >= (local.bpAt ?? "")) {
    Object.assign(next, { bloodPressure: `${bp.systolic}/${bp.diastolic}`, bpLastUpdated: labelOf(bp.timestamp, now), bpAt: bp.timestamp, bpLogId: bp.id });
  }
  if (weight && weight.timestamp >= (local.weightAt ?? "")) {
    Object.assign(next, { weight: weight.kg, weightLastUpdated: labelOf(weight.timestamp, now), weightAt: weight.timestamp, weightLogId: weight.id });
  }
  if (kick && kick.date === today && !keepKicks) Object.assign(next, { kicks: kick.count, kicksDate: kick.date });
  return next;
}
