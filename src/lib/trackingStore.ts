"use client";

import { useEffect, useState } from "react";
import { addKicks, dayKey, saveBloodPressure as syncBP, saveWeight as syncWeight } from "@/lib/healthLogs";

export interface TrackingData {
  bloodPressure: string; // e.g. "120/80"
  bpLastUpdated: string; // e.g. "วันนี้ 08:00"
  weight: number;
  weightLastUpdated: string;
  kicks: number;
  // id/เวลา ของรายการล่าสุดบน Firestore — ใช้ตอน "แก้ไข" ให้ทับรายการเดิมแทนการเพิ่มใหม่
  bpLogId?: string;
  bpAt?: string;
  weightLogId?: string;
  weightAt?: string;
  kicksDate?: string; // ลูกดิ้นนับรายวัน (YYYY-MM-DD)
}

const STORAGE_KEY = "bumply_tracking_data";

const defaultData: TrackingData = {
  bloodPressure: "-",
  bpLastUpdated: "-",
  weight: 0,
  weightLastUpdated: "-",
  kicks: 0,
};

const timeLabel = () => {
  const now = new Date();
  return `วันนี้ ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

// เก็บในเครื่องก่อนเสมอ (ใช้ได้แม้ออฟไลน์) แล้วค่อยส่งขึ้น Firestore ให้หน้าประวัติ/admin เห็น
const logSyncError = (what: string) => (err: unknown) => console.error(`Error syncing ${what}:`, err);

export function useTrackingStore() {
  const [data, setData] = useState<TrackingData>(defaultData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setData(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse tracking data", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // functional update: id จาก Firestore กลับมาทีหลัง ตอนนั้น data ใน closure อาจเก่าแล้ว
  const patch = (p: Partial<TrackingData>) =>
    setData((prev) => {
      const next = { ...prev, ...p };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });

  // isEdit: แก้ค่าล่าสุดที่บันทึกผิด (ทับรายการเดิม เวลาเดิม) / ไม่ใช่: บันทึกครั้งใหม่
  const saveBloodPressure = (bp: string, isEdit: boolean) => {
    const [sys, dia] = bp.split("/").map(Number);
    const at = (isEdit && data.bpAt) || new Date().toISOString();
    const id = isEdit ? data.bpLogId : undefined;
    patch(isEdit ? { bloodPressure: bp } : { bloodPressure: bp, bpLastUpdated: timeLabel(), bpAt: at, bpLogId: undefined });
    syncBP(sys, dia, at, id).then((bpLogId) => patch({ bpLogId })).catch(logSyncError("blood pressure"));
  };

  const saveWeight = (w: number, isEdit: boolean) => {
    const at = (isEdit && data.weightAt) || new Date().toISOString();
    const id = isEdit ? data.weightLogId : undefined;
    patch(isEdit ? { weight: w } : { weight: w, weightLastUpdated: timeLabel(), weightAt: at, weightLogId: undefined });
    syncWeight(w, at, id).then((weightLogId) => patch({ weightLogId })).catch(logSyncError("weight"));
  };

  // วันใหม่เริ่มนับจาก 0
  const kicksToday = data.kicksDate === dayKey() ? data.kicks : 0;

  const changeKicks = (delta: 1 | -1) => {
    if (kicksToday + delta < 0) return;
    patch({ kicks: kicksToday + delta, kicksDate: dayKey() });
    addKicks(delta).catch(logSyncError("kicks"));
  };

  return {
    data,
    isLoaded,
    kicksToday,
    saveBloodPressure,
    saveWeight,
    addKick: () => changeKicks(1),
    removeKick: () => changeKicks(-1),
  };
}
