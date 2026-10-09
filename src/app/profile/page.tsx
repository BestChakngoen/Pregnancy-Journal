"use client";

import { motion } from "framer-motion";
import { User, Settings, LogOut, Heart, BellRing, CircleUserRound, ChevronRight } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="pb-28 pt-8 px-6 min-h-dvh flex flex-col bg-slate-50 relative overflow-hidden">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">โปรไฟล์</h1>
        <button className="p-2 bg-white/60 backdrop-blur-md rounded-full shadow-sm text-slate-500 hover:text-slate-700 transition-colors">
          <Settings className="w-6 h-6" />
        </button>
      </header>

      <main className="flex flex-col gap-6 flex-1">
        
        {/* User Card */}
        <section>
          <motion.div 
            whileHover={{ y: -2 }}
            className="w-full flex items-center gap-5 p-6 bg-gradient-to-br from-pink-100/80 to-blue-50/80 backdrop-blur-md rounded-[2rem] border border-white/60 shadow-sm transition-all"
          >
            <div className="w-16 h-16 bg-white/60 rounded-full flex items-center justify-center shrink-0 border border-white shadow-sm">
              <CircleUserRound className="w-8 h-8 text-pink-500" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-slate-800/90 tracking-tight">แม่ส้ม (Sarah)</h2>
              <p className="text-sm font-medium text-slate-600/80 mt-0.5">อายุ 28 ปี • ท้องแรก</p>
            </div>
          </motion.div>
        </section>

        {/* Free-floating Menu List (No Generic Box/Dividers) */}
        <section className="flex flex-col gap-3 mt-2">
          <button className="flex items-center justify-between p-4 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/40 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:bg-white/80 transition-all active:scale-[0.98] group">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-blue-100/80 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                <User className="w-5 h-5" />
              </div>
              <span className="font-semibold text-slate-700/90 text-sm">ข้อมูลส่วนตัว</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400/80 group-hover:text-slate-600 transition-colors group-hover:translate-x-1" />
          </button>
          
          <button className="flex items-center justify-between p-4 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/40 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:bg-white/80 transition-all active:scale-[0.98] group">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-pink-100/80 text-pink-600 rounded-xl group-hover:scale-110 transition-transform">
                <Heart className="w-5 h-5" />
              </div>
              <span className="font-semibold text-slate-700/90 text-sm">ประวัติสุขภาพ</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400/80 group-hover:text-slate-600 transition-colors group-hover:translate-x-1" />
          </button>

          <button className="flex items-center justify-between p-4 bg-white/40 backdrop-blur-sm rounded-2xl border border-white/40 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] hover:bg-white/80 transition-all active:scale-[0.98] group">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-amber-100/80 text-amber-600 rounded-xl group-hover:scale-110 transition-transform">
                <BellRing className="w-5 h-5" />
              </div>
              <span className="font-semibold text-slate-700/90 text-sm">การแจ้งเตือน</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400/80 group-hover:text-slate-600 transition-colors group-hover:translate-x-1" />
          </button>
        </section>

        {/* Logout */}
        <section className="mt-8">
          <button className="w-full flex items-center justify-center gap-2 p-4 bg-red-50/50 backdrop-blur-md rounded-2xl border border-red-100/50 text-red-500/90 font-semibold shadow-sm hover:bg-red-100/50 hover:text-red-600 transition-colors active:scale-[0.98]">
            <LogOut className="w-5 h-5" />
            ออกจากระบบ
          </button>
        </section>

      </main>
    </div>
  );
}
