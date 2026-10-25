"use client";

import { useEffect, useState } from "react";
import { Lightbulb } from "lucide-react";
import { DAILY_TIPS, TIP_INTERVAL_MS, nextTipIndex, randomTipIndex } from "@/lib/dailyTips";
import { cn } from "@/lib/utils";

// ทิปส์ประจำวัน: เริ่มจากข้อสุ่ม แล้วสลับข้อต่อไปเองทุก TIP_INTERVAL_MS (ไม่มีปุ่ม/จุดควบคุม)
// ทุกข้อซ้อนกันในช่องกริดเดียว: การ์ดสูงเท่าข้อที่ยาวที่สุดเสมอ จึงไม่กระโดดตอนสลับ และเลือนเข้าออกแบบ crossfade
export default function DailyTipCard() {
  const [index, setIndex] = useState(() => randomTipIndex(DAILY_TIPS.length));

  useEffect(() => {
    const id = setInterval(() => {
      if (!document.hidden) setIndex((i) => nextTipIndex(i, DAILY_TIPS.length)); // แท็บถูกซ่อน = ไม่สลับ (ประหยัดแบตเตอรี่)
    }, TIP_INTERVAL_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="flex items-center gap-4 p-5 bg-gradient-to-r from-yellow-50 to-orange-50/30 rounded-[1.5rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
      <div className="p-2.5 bg-yellow-100/80 rounded-xl shrink-0">
        <Lightbulb className="w-5 h-5 text-yellow-600" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-800/90">ทิปส์ประจำวัน</p>
        {/* aria-live="off": ไม่ให้โปรแกรมอ่านหน้าจอประกาศทุก 8 วินาที — ข้อที่ไม่ได้แสดงถูกซ่อนจากโปรแกรมอ่านหน้าจอ */}
        <div className="grid mt-0.5" aria-live="off">
          {DAILY_TIPS.map((tip, i) => (
            <p
              key={tip}
              aria-hidden={i !== index}
              className={cn(
                "col-start-1 row-start-1 text-xs text-slate-600 leading-relaxed transition-[opacity,visibility] duration-500 motion-reduce:transition-none",
                i === index ? "opacity-100 visible" : "opacity-0 invisible"
              )}
            >
              {tip}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
