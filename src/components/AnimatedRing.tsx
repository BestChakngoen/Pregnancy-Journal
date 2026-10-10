"use client";

import { motion } from "framer-motion";
import NumberTicker from "@/components/magicui/number-ticker";

export default function AnimatedRing({ week, daysToGo }: { week: number; daysToGo: number }) {
  const totalWeeks = 40;
  const progressPercent = Math.min((week / totalWeeks), 1);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - progressPercent * circumference;

  return (
    <div className="relative flex items-center justify-center p-6">
      <div className="relative w-56 h-56">
        {/* Glowing Background Effect */}
        <motion.div 
          className="absolute inset-[-20%] bg-[radial-gradient(circle,rgba(249,168,212,0.4)_0%,transparent_60%)] rounded-full"
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        
        {/* SVG Ring */}
        <svg className="w-full h-full -rotate-90 relative z-10" viewBox="0 0 100 100">
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
          className="absolute inset-0 flex items-center justify-center flex-col bg-white/20 rounded-full m-5 shadow-[inset_0_0_20px_rgba(255,255,255,0.8)] backdrop-blur-md z-20"
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
          <span className="text-xs text-slate-500">เหลืออีก <NumberTicker value={daysToGo} delay={0.8} /> วัน</span>
        </motion.div>
      </div>
    </div>
  );
}
