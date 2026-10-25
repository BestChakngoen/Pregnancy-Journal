// ค่าตั้งการแจ้งเตือนของ "เครื่องนี้" + ตัดสินว่าเครื่องรองรับหรือไม่ — ฟังก์ชันล้วน (ไม่มี browser API/React) จึงทดสอบด้วย node ได้
// เก็บในเครื่องเท่านั้น: สิทธิ์แจ้งเตือนเป็นของเบราว์เซอร์แต่ละเครื่อง และค่านี้ถูกล้างตอนออกจากระบบ (userStore.logout)
export const NOTIFY_STORAGE_KEY = "momsafe_notify";

export interface NotifyPrefs {
  enabled: boolean; // ผู้ใช้เปิดสวิตช์ (ต้องได้สิทธิ์จากเบราว์เซอร์ด้วยจึงถือว่าใช้งานจริง — ดู isActive)
  bp: boolean; // เตือนวัดและบันทึกความดันทุกวัน
  kicks: boolean; // เตือนนับลูกดิ้น
}

export const DEFAULT_NOTIFY_PREFS: NotifyPrefs = { enabled: false, bp: true, kicks: true };

// อ่านจาก localStorage อย่างปลอดภัย: ข้อความเสีย/ชนิดผิด = ใช้ค่าเริ่มต้นเป็นรายช่อง
export function parseNotifyPrefs(raw: string | null): NotifyPrefs {
  try {
    const o = JSON.parse(raw ?? "null");
    if (o === null || typeof o !== "object") return DEFAULT_NOTIFY_PREFS;
    const pick = (k: keyof NotifyPrefs) => (typeof o[k] === "boolean" ? (o[k] as boolean) : DEFAULT_NOTIFY_PREFS[k]);
    return { enabled: pick("enabled"), bp: pick("bp"), kicks: pick("kicks") };
  } catch {
    return DEFAULT_NOTIFY_PREFS;
  }
}

export type PermissionState = "default" | "granted" | "denied";

// ใช้งานจริง = ผู้ใช้เปิดสวิตช์ และเบราว์เซอร์ยังให้สิทธิ์ (ถ้าผู้ใช้ไปปิดสิทธิ์ในการตั้งค่าเบราว์เซอร์ ก็ถือว่าไม่ใช้งาน)
export const isActive = (prefs: NotifyPrefs, permission: PermissionState) => prefs.enabled && permission === "granted";

export type NotifySupport = "ok" | "ios" | "unsupported";

export interface NotifyEnv {
  hasNotification: boolean;
  hasServiceWorker: boolean;
  userAgent: string;
  platform: string;
  maxTouchPoints: number;
}

// iPhone/iPad (รวม iPadOS ที่ส่ง UA เหมือน Mac) ยังไม่รองรับในรอบนี้: ต้องเพิ่มเว็บไว้หน้าจอโฮม (manifest + ไอคอน) ซึ่งยังไม่ได้ทำ
export function notifySupport(env: NotifyEnv): NotifySupport {
  const isIOS = /iPhone|iPad|iPod/.test(env.userAgent) || (env.platform === "MacIntel" && env.maxTouchPoints > 1);
  if (isIOS) return "ios";
  return env.hasNotification && env.hasServiceWorker ? "ok" : "unsupported";
}
