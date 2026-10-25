"use client";

import { useEffect, useState } from "react";
import { addKicks, dayKey, saveBloodPressure as syncBP, saveWeight as syncWeight } from "@/lib/healthLogs";
import { pullHealth } from "@/lib/cloudSync";
import { resolveEdit, type EditDecision } from "@/lib/mergeHealth";
import { useAlertStore } from "@/lib/alertStore";

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

// อ่านจาก localStorage สดๆ ทุกครั้ง (ไม่ใช้ state ใน closure ซึ่งอาจเก่าหลังรอซิงค์/รอ id จาก Firestore)
const readLocal = (): TrackingData => {
  try {
    return { ...defaultData, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") };
  } catch {
    return defaultData;
  }
};

// ซิงค์จาก Cloud ก่อนบันทึก: ทำทีละงานตามลำดับ — ระหว่างรอซิงค์ถ้ากดซ้ำรัวๆ (เช่นนับลูกดิ้น) จะไม่นับทับกัน
let queue: Promise<unknown> = Promise.resolve();
const inOrder = (task: () => Promise<void>) => {
  queue = queue.then(task).catch(logSyncError("tracking"));
};

const PULL_TTL_MS = 15_000; // นับลูกดิ้น: ซิงค์ไปแล้วภายในเวลานี้ไม่ซิงค์ซ้ำ (กดรัวๆ ไม่ต้องรอเครือข่ายทุกครั้ง; ออฟไลน์ก็ไม่ลองซ้ำทุกครั้ง) — ความดัน/น้ำหนักซิงค์ทุกครั้ง
let lastPull = 0;
let lastPullOk = false;
let pendingKicks = 0; // การนับลูกดิ้นที่ยังส่งขึ้น Cloud ไม่เสร็จ — ระหว่างนี้ไม่เอาตัวนับจาก Cloud มาทับ ไม่งั้นค่าจะถอยกลับ

// แจ้งผู้ใช้ว่าทำไมค่าที่กด "แก้ไข" ถึงถูกบันทึกเป็นรายการใหม่แทนการทับรายการเดิม
const notifyNotOverwritten = (what: string, reason: NonNullable<EditDecision["reason"]>) =>
  useAlertStore.getState().showAlert(
    reason === "newer"
      ? {
          type: "info",
          title: "มีข้อมูลใหม่จากอุปกรณ์อื่น",
          message: `พบ${what}ที่บันทึกไว้ใหม่กว่าค่าที่แก้ จึงบันทึกค่านี้เป็นรายการใหม่ ไม่ทับรายการเดิม`,
          confirmText: "รับทราบ",
        }
      : {
          type: "warning",
          title: "ซิงค์ข้อมูลจาก Cloud ไม่สำเร็จ",
          message: `จึงบันทึก${what}นี้เป็นรายการใหม่ ไม่ทับรายการเดิม เพื่อกันข้อมูลที่อาจเปลี่ยนจากอุปกรณ์อื่นหาย`,
          confirmText: "รับทราบ",
        }
  );

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

  const write = (next: TrackingData) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setData(next);
    return next;
  };
  const patch = (p: Partial<TrackingData>) => write({ ...readLocal(), ...p });

  // ก่อนบันทึก: ดึงรายการล่าสุดจาก Cloud มารวมกับในเครื่อง (ใหม่กว่าชนะ) แล้วคืนค่าที่รวมแล้ว + synced (ซิงค์สำเร็จหรือไม่)
  // ซิงค์ไม่ได้ (ออฟไลน์/ไม่ได้ล็อกอิน/ช้าเกิน) = คืนข้อมูลในเครื่อง: บันทึกรายการใหม่/นับลูกดิ้นทำต่อได้ แต่ห้ามแก้ทับรายการเดิม (ดู resolveEdit)
  const syncFromCloud = async (force = false) => {
    const local = readLocal();
    if (!force && Date.now() - lastPull < PULL_TTL_MS) return { data: local, synced: lastPullOk };
    const merged = await pullHealth(local, pendingKicks > 0);
    lastPull = Date.now();
    lastPullOk = merged !== null;
    return merged ? { data: write(merged), synced: true } : { data: local, synced: false };
  };

  // isEdit: แก้ค่าล่าสุดที่บันทึกผิด (ทับรายการเดิม เวลาเดิม) / ไม่ใช่: บันทึกครั้งใหม่
  // แก้ทับได้เมื่อซิงค์สำเร็จและรายการล่าสุดยังเป็นรายการที่ผู้ใช้เห็น — ไม่งั้นบันทึกเป็นรายการใหม่แทนและแจ้งผู้ใช้ (resolveEdit)
  const saveBloodPressure = (bp: string, isEdit: boolean) =>
    inOrder(async () => {
      const seenAt = readLocal().bpAt;
      const { data: fresh, synced } = await syncFromCloud(true);
      const { edit, reason } = resolveEdit(isEdit, synced, seenAt, fresh.bpAt);
      if (reason) notifyNotOverwritten("ความดัน", reason);
      const [sys, dia] = bp.split("/").map(Number);
      const at = (edit && fresh.bpAt) || new Date().toISOString();
      const id = edit ? fresh.bpLogId : undefined;
      patch(edit ? { bloodPressure: bp } : { bloodPressure: bp, bpLastUpdated: timeLabel(), bpAt: at, bpLogId: undefined });
      syncBP(sys, dia, at, id).then((bpLogId) => patch({ bpLogId })).catch(logSyncError("blood pressure"));
    });

  const saveWeight = (w: number, isEdit: boolean) =>
    inOrder(async () => {
      const seenAt = readLocal().weightAt;
      const { data: fresh, synced } = await syncFromCloud(true);
      const { edit, reason } = resolveEdit(isEdit, synced, seenAt, fresh.weightAt);
      if (reason) notifyNotOverwritten("น้ำหนัก", reason);
      const at = (edit && fresh.weightAt) || new Date().toISOString();
      const id = edit ? fresh.weightLogId : undefined;
      patch(edit ? { weight: w } : { weight: w, weightLastUpdated: timeLabel(), weightAt: at, weightLogId: undefined });
      syncWeight(w, at, id).then((weightLogId) => patch({ weightLogId })).catch(logSyncError("weight"));
    });

  // วันใหม่เริ่มนับจาก 0
  const kicksToday = data.kicksDate === dayKey() ? data.kicks : 0;

  const changeKicks = (delta: 1 | -1) =>
    inOrder(async () => {
      const { data: fresh } = await syncFromCloud();
      const today = fresh.kicksDate === dayKey() ? fresh.kicks : 0;
      if (today + delta < 0) return;
      patch({ kicks: today + delta, kicksDate: dayKey() });
      pendingKicks++;
      addKicks(delta).catch(logSyncError("kicks")).finally(() => pendingKicks--);
    });

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
