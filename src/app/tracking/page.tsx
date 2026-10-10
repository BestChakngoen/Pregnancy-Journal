"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";
import { Activity, HeartPulse, Scale, Footprints, ChevronRight, Plus, Droplet } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTrackingStore } from "@/lib/trackingStore";
import { BloodPressureModal, WeightModal } from "@/components/TrackingModals";

// Framer Motion Variants for Staggered Entrance
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } },
};

export default function TrackingPage() {
  const router = useRouter();
  const { data, updateBloodPressure, updateWeight, addKick, addWater } = useTrackingStore();
  
  const [isBPModalOpen, setIsBPModalOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);

  // Split BP for display if it has "/"
  const bpParts = data.bloodPressure.split("/");
  const sys = bpParts[0] || "-";
  const dia = bpParts[1] || "-";

  return (
    <div className="pb-28 pt-8 px-4 min-h-dvh flex flex-col relative overflow-hidden bg-slate-50">
      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 px-2"
      >
        <div className="w-12 h-12 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm flex items-center justify-center mb-3">
          <Activity className="w-6 h-6 text-blue-500" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">บันทึกสุขภาพ</h1>
        <p className="text-slate-500 mt-1">ติดตามพัฒนาการและเฝ้าระวังความเสี่ยง</p>
      </motion.header>

      {/* Bento Grid */}
      <motion.main 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-4 flex-1 auto-rows-max"
      >
        
        {/* Core Tracker: Blood Pressure (Span 2 cols) */}
        <motion.section variants={itemVariants} className="col-span-2">
          <div className="flex items-center justify-between mb-2 ml-1">
            <h3 className="font-semibold text-slate-800/90 text-sm">ความดันโลหิต</h3>
            <button 
              onClick={() => setIsBPModalOpen(true)}
              className="min-h-[44px] min-w-[44px] px-4 font-bold text-blue-600 bg-blue-50 rounded-full flex items-center justify-center gap-1 hover:bg-blue-100 transition-colors"
            >
              <Plus className="w-4 h-4" /> บันทึก
            </button>
          </div>
          
          <motion.div 
            whileHover={{ y: -2 }}
            className="w-full flex flex-col p-5 bg-gradient-to-br from-white/90 to-blue-50/80 backdrop-blur-md rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all relative overflow-hidden"
          >
            {/* Fake Sparkline SVG for Pro Data Viz Look */}
            <svg className="absolute bottom-0 left-0 w-full h-24 opacity-20 pointer-events-none text-blue-500" viewBox="0 0 100 30" preserveAspectRatio="none">
              <path d="M0,30 Q10,15 20,25 T40,10 T60,20 T80,5 T100,20 L100,30 L0,30 Z" fill="url(#blue-gradient)"/>
              <path d="M0,30 Q10,15 20,25 T40,10 T60,20 T80,5 T100,20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke"/>
              <defs>
                <linearGradient id="blue-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
                  <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>

            <div className="flex items-center justify-between mb-2">
              <div className="p-2 bg-red-100/80 rounded-xl">
                <HeartPulse className="w-5 h-5 text-red-500" />
              </div>
              {data.bloodPressure !== "-" && (
                <div className="px-2.5 py-1 bg-emerald-100/80 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wide">
                  บันทึกแล้ว
                </div>
              )}
            </div>
            
            <div className="flex items-baseline gap-2 mt-1 relative z-10">
              <span className="text-4xl font-extrabold text-slate-800/90 tabular-nums tracking-tighter">
                {sys}<span className="text-2xl text-slate-400 font-semibold mx-0.5">/</span>{dia}
              </span>
              <span className="text-xs text-slate-500/80 font-bold mb-1 uppercase tracking-wider">mmHg</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">อัปเดตล่าสุด: {data.bpLastUpdated}</p>
          </motion.div>
        </motion.section>

        {/* Secondary Tracker: Weight (Tall Box) */}
        <motion.button 
          variants={itemVariants} 
          onClick={() => setIsWeightModalOpen(true)}
          className="col-span-1 row-span-2 flex flex-col p-5 bg-white/60 backdrop-blur-md rounded-[2rem] shadow-sm hover:bg-white/80 transition-all active:scale-95 text-left group relative overflow-hidden"
        >
          {/* Mini trend line */}
          <svg className="absolute bottom-6 right-0 w-24 h-16 opacity-30 pointer-events-none group-hover:opacity-60 transition-opacity text-amber-600" viewBox="0 0 50 30" preserveAspectRatio="none">
            <path d="M0,25 Q10,20 20,15 T40,5 L50,0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke"/>
          </svg>
          
          <div className="flex justify-between items-start mb-4">
            <div className="p-2.5 bg-amber-100/80 rounded-xl w-fit group-hover:-translate-y-1 transition-transform">
              <Scale className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <h4 className="font-semibold text-slate-700/90 text-sm mb-1">น้ำหนัก</h4>
          <div className="flex flex-col mt-auto pt-4 relative z-10">
            <span className="text-3xl font-extrabold text-slate-800/90 tabular-nums leading-none tracking-tight">
              {data.weight > 0 ? data.weight : "-"}
            </span>
            <span className="text-xs text-slate-500/80 font-bold mt-1">กิโลกรัม</span>
          </div>
          <div className="mt-2 text-xs font-medium text-amber-600 bg-amber-50 w-fit px-2 py-0.5 rounded-full">
            {data.weightLastUpdated !== "-" ? "อัปเดตล่าสุด: " + data.weightLastUpdated : "แตะเพื่อบันทึก"}
          </div>
        </motion.button>

        {/* Secondary Tracker: Kick Counter (Square) */}
        <motion.button 
          variants={itemVariants} 
          onClick={addKick}
          className="col-span-1 flex flex-col p-4 bg-white/60 backdrop-blur-md rounded-[2rem] shadow-sm hover:bg-white/80 transition-all active:scale-95 text-left group relative overflow-hidden"
        >
          <div className="absolute -right-4 -bottom-4 w-16 h-16 bg-pink-200/50 rounded-full blur-xl group-hover:scale-150 transition-transform -z-10" />
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-pink-100/80 rounded-xl group-hover:-translate-y-1 transition-transform">
              <Footprints className="w-4 h-4 text-pink-600" />
            </div>
            <div className="px-2 py-0.5 bg-pink-50 text-pink-600 text-xs font-bold rounded-full">
              แตะเพื่อนับ
            </div>
          </div>
          <h4 className="font-semibold text-slate-700/90 text-sm">ลูกดิ้น</h4>
          <div className="flex items-baseline gap-1 mt-auto pt-2">
            <span className="text-2xl font-extrabold text-pink-600 tabular-nums">{data.kicks}</span>
            <span className="text-xs text-pink-500/70 font-bold">ครั้ง</span>
          </div>
        </motion.button>

        {/* Secondary Tracker: Water (Square) */}
        <motion.button 
          variants={itemVariants} 
          onClick={addWater}
          className="col-span-1 flex flex-col p-4 bg-white/60 backdrop-blur-md rounded-[2rem] shadow-sm hover:bg-white/80 transition-all active:scale-95 text-left group relative overflow-hidden"
        >
          <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-cyan-200/50 rounded-full blur-xl group-hover:scale-150 transition-transform -z-10" />
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-cyan-100/80 rounded-xl group-hover:-translate-y-1 transition-transform">
              <Droplet className="w-4 h-4 text-cyan-600" />
            </div>
            <div className="px-2 py-0.5 bg-cyan-50 text-cyan-600 text-xs font-bold rounded-full">
              แตะเพื่อดื่ม
            </div>
          </div>
          <h4 className="font-semibold text-slate-700/90 text-sm">ดื่มน้ำ</h4>
          <div className="flex items-baseline gap-1 mt-auto pt-2">
            <span className="text-2xl font-extrabold text-cyan-600 tabular-nums">{data.waterGlasses}</span>
            <span className="text-xs text-cyan-500/70 font-bold">/8 แก้ว</span>
          </div>
        </motion.button>

        {/* Action Banner (Span 2 cols) - Premium Glass Design */}
        <motion.section variants={itemVariants} className="col-span-2 mt-2">
          <button 
            onClick={() => router.push('/assessment')}
            className="w-full flex items-center justify-between p-5 bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(244,114,182,0.15)] active:scale-95 transition-all group overflow-hidden relative"
          >
            <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-pink-100/30 to-transparent -skew-x-12 animate-shimmer" />
            
            <div className="flex flex-col text-left relative z-10">
              <span className="font-extrabold text-lg text-slate-800 tracking-tight">ประเมินความเสี่ยง</span>
              <span className="text-xs font-semibold text-pink-500">แบบคัดกรองภาวะแทรกซ้อนวันนี้</span>
            </div>
            <div className="p-2 bg-pink-100 text-pink-600 rounded-full group-hover:translate-x-1 group-hover:bg-pink-500 group-hover:text-white transition-all shadow-sm relative z-10">
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        </motion.section>

      </motion.main>

      <BloodPressureModal 
        isOpen={isBPModalOpen} 
        onClose={() => setIsBPModalOpen(false)} 
        onSave={(bp) => updateBloodPressure(bp)} 
      />
      <WeightModal 
        isOpen={isWeightModalOpen} 
        onClose={() => setIsWeightModalOpen(false)} 
        onSave={(w) => updateWeight(w)} 
      />
    </div>
  );
}
