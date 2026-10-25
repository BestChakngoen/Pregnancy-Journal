// Service worker ของ MomSafe — ตอนนี้ทำหน้าที่เดียว: เมื่อผู้ใช้แตะการแจ้งเตือน ให้เปิด/โฟกัสแอป
// ไม่มี fetch handler (ไม่แคชไฟล์ ไม่ดักคำขอ) และยังไม่รับ push — ระบบส่งเตือนอัตโนมัติจะเพิ่มทีหลัง
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || "/", self.location.origin);
  // รับเฉพาะลิงก์ในเว็บเดียวกัน
  const url = target.origin === self.location.origin ? target.href : self.location.origin + "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const open = windows.find((w) => w.url.startsWith(self.location.origin));
      return open ? open.focus() : self.clients.openWindow(url);
    })
  );
});
