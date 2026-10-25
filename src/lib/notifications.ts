// ส่วนที่เรียก API ของเบราว์เซอร์สำหรับการแจ้งเตือน (ตรรกะล้วนอยู่ที่ notificationPrefs.ts) — เรียกใช้ฝั่งไคลเอนต์เท่านั้น
import { notifySupport, type NotifySupport, type PermissionState } from "@/lib/notificationPrefs";

const WORKER_URL = "/sw.js";

export const currentSupport = (): NotifySupport =>
  notifySupport({
    hasNotification: "Notification" in window,
    hasServiceWorker: "serviceWorker" in navigator,
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    maxTouchPoints: navigator.maxTouchPoints,
  });

export const currentPermission = (): PermissionState => Notification.permission;

// ต้องเรียกจากการแตะของผู้ใช้โดยตรง (เบราว์เซอร์ไม่ให้ขอสิทธิ์เองโดยไม่มีการกระทำของผู้ใช้)
export const requestPermission = (): Promise<PermissionState> => Notification.requestPermission();

// Android Chrome แสดงการแจ้งเตือนจากหน้าเว็บตรงๆ ไม่ได้ ต้องผ่าน service worker
export async function registerWorker() {
  await navigator.serviceWorker.register(WORKER_URL, { scope: "/" });
  return navigator.serviceWorker.ready;
}

export async function showTestNotification() {
  const reg = await registerWorker();
  await reg.showNotification("MomSafe", {
    body: "ทดสอบการแจ้งเตือน: เครื่องนี้พร้อมรับการแจ้งเตือนแล้ว",
    tag: "momsafe-test",
    data: { url: "/" },
  });
}
