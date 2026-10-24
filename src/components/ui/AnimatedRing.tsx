"use client";

import { motion } from "framer-motion";
import NumberTicker from "@/components/magicui/number-ticker";

export default function AnimatedRing({ 
  week, 
  edd, 
  onEddChange 
}: { 
  week: number; 
  edd?: string; 
  onEddChange?: (date: string) => void 
}) {
  const totalWeeks = 40;
  const progressPercent = Math.min((week / totalWeeks), 1);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - progressPercent * circumference;

  return (
    <div className="relative flex items-center justify-center p-6">
      <div className="relative w-56 h-56">
        {/* Glowing Background Effect — CSS animation วิ่งบน compositor ไม่กิน main thread ทุกเฟรมแบบ framer-motion */}
        <div className="absolute inset-[-20%] bg-[radial-gradient(circle,rgba(249,168,212,0.4)_0%,transparent_60%)] rounded-full pointer-events-none animate-glow" />
        
        {/* SVG Ring */}
        <svg className="w-full h-full -rotate-90 relative z-10 pointer-events-none" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-pink-100"
          />
          <motion.circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
            className="text-pink-400"
          />
        </svg>
        
        {/* Inner Content */}
        <motion.div 
          className="absolute inset-0 flex items-center justify-center flex-col bg-white/20 rounded-full m-5 shadow-[inset_0_0_20px_rgba(255,255,255,0.8)] z-20 pointer-events-auto"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <span className="text-sm font-medium text-slate-500">สัปดาห์ที่</span>
          <motion.span 
            className="text-6xl font-bold text-blue-500 my-1 drop-shadow-sm"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <NumberTicker value={week} delay={0.8} />
          </motion.span>
          <div className="flex flex-col items-center z-30 mt-1">
            <span className="text-[10px] text-slate-500 font-medium mb-0.5">กำหนดคลอด</span>
            <input 
              type="date" 
              value={edd || ""}
              onChange={(e) => onEddChange?.(e.target.value)}
              className="text-xs font-sans bg-white/60 border border-pink-200/50 rounded-full px-2 py-0.5 text-slate-600 focus:outline-none focus:ring-2 focus:ring-pink-400 cursor-pointer w-[110px]"
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
