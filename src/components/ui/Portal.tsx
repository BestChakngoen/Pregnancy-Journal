"use client";

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

const noopSubscribe = () => () => {};

// ย้าย overlay/modal ไปไว้ใต้ <body> โดยตรง: กล่องเนื้อหาหลักใน layout เป็น stacking context (isolate)
// z-index ของ modal ข้างในจึงแพ้แถบเมนู (z-40) ที่อยู่นอกกล่อง ทำให้เมนูบังปุ่มบันทึก
export default function Portal({ children }: { children: React.ReactNode }) {
  // false ตอน prerender/hydrate (ไม่มี document) แล้วเป็น true หลัง hydrate
  const isClient = useSyncExternalStore(noopSubscribe, () => true, () => false);
  return isClient ? createPortal(children, document.body) : null;
}
