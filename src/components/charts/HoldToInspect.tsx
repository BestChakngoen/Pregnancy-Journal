"use client";

import { useRef } from "react";

const HOLD_MS = 150; // กดค้างเกินนี้ถึงแสดงค่า — สั้นกว่านี้ถือเป็นการแตะหรือเริ่มเลื่อนหน้า (tooltip จะไม่แวบ)
const SCROLL_PX = 8; // ขยับนิ้วเกินนี้ก่อนครบเวลา = กำลังเลื่อนหน้า ไม่ใช่กดค้าง

// มือถือ: กดค้างที่กราฟเพื่อดูค่า (ลากนิ้วไล่ดูได้) ปล่อยนิ้วแล้วซ่อนทันที
// Recharts เดิมแสดงค่าตอน "ปล่อยนิ้ว" (จาก mouse event ที่เบราว์เซอร์จำลองหลังแตะ) แล้วค้างไว้จนกว่าจะแตะที่อื่น และกดค้างเฉยๆ ไม่แสดงอะไร
// จึงดักเหตุการณ์สัมผัสไว้เอง (ไม่ส่งต่อให้ Recharts) แล้วส่ง mousemove ให้ Recharts เฉพาะตอนกดค้าง — เมาส์บนคอมไม่เกี่ยว
export default function HoldToInspect({ children }: { children: React.ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const touch = useRef({ x: 0, y: 0, x0: 0, y0: 0, timer: 0, held: false });

  const send = (type: "mousemove" | "mouseout", x = 0, y = 0) =>
    box.current?.querySelector(".recharts-wrapper")?.dispatchEvent(new MouseEvent(type, { bubbles: true, clientX: x, clientY: y }));

  const release = () => {
    const t = touch.current;
    window.clearTimeout(t.timer);
    if (!t.held) return;
    t.held = false;
    // Recharts หน่วง mousemove ไว้ 1 เฟรม: ส่งจุดนอกกราฟเพื่อยกเลิกอันที่รอ แล้วให้มันล้างค่าเอง (mouseout ล้างทันที)
    send("mousemove", -1e4, -1e4);
    send("mouseout");
  };

  return (
    <div
      ref={box}
      className="h-full w-full"
      style={{ touchAction: "pan-y pinch-zoom" }} // ลากแนวตั้ง = เลื่อนหน้าตามปกติ, แนวนอน = ไล่ดูค่า, ซูมด้วยสองนิ้วยังได้
      onTouchStartCapture={(e) => {
        e.stopPropagation();
        const { clientX: x, clientY: y } = e.touches[0];
        const t = touch.current;
        window.clearTimeout(t.timer);
        Object.assign(t, { x, y, x0: x, y0: y, held: false });
        t.timer = window.setTimeout(() => {
          t.held = true;
          send("mousemove", t.x, t.y);
        }, HOLD_MS);
      }}
      onTouchMoveCapture={(e) => {
        e.stopPropagation();
        const { clientX: x, clientY: y } = e.touches[0];
        const t = touch.current;
        t.x = x;
        t.y = y;
        if (t.held) send("mousemove", x, y);
        else if (Math.hypot(x - t.x0, y - t.y0) > SCROLL_PX) window.clearTimeout(t.timer);
      }}
      onTouchEndCapture={(e) => {
        e.stopPropagation();
        if (e.cancelable) e.preventDefault(); // กันเบราว์เซอร์จำลอง mouse event หลังปล่อยนิ้ว (ต้นเหตุที่ tooltip ค้าง)
        release();
      }}
      onTouchCancelCapture={(e) => {
        e.stopPropagation();
        release();
      }}
    >
      {children}
    </div>
  );
}
