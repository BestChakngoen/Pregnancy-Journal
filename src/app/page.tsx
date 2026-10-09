"use client";

import { useState } from "react";
import AnimatedRing from "@/components/AnimatedRing";
import AnimatedCard from "@/components/AnimatedCard";
import SymptomLogger from "@/components/SymptomLogger";
import RedFlagAlert from "@/components/RedFlagAlert";
import { PenSquare, Calendar, AlertTriangle, Lightbulb, ChevronRight, User, Bell, Home, Activity, BookOpen } from "lucide-react";

export default function Dashboard() {
  const [isLoggerOpen, setIsLoggerOpen] = useState(false);
  const [redFlagSymptom, setRedFlagSymptom] = useState<string | null>(null);

  const handleRedFlagTrigger = (symptomName: string) => {
    setIsLoggerOpen(false); // Close logger
    setTimeout(() => {
      setRedFlagSymptom(symptomName); // Open alert after a tiny delay for smooth animation
    }, 300);
  };

  return (
    <div className="pb-24">
      <SymptomLogger 
        isOpen={isLoggerOpen} 
        onClose={() => setIsLoggerOpen(false)} 
        onRedFlagTrigger={handleRedFlagTrigger}
      />
      
      <RedFlagAlert 
        isOpen={!!redFlagSymptom} 
        symptomName={redFlagSymptom || ""} 
        onClose={() => setRedFlagSymptom(null)} 
      />

      {/* Header */}
      <header className="flex flex-col gap-4 p-6 pb-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-500 tracking-tight">Bumply</h1>
          <div className="flex items-center gap-3">
            <button className="p-2 bg-white/50 rounded-full hover:bg-white/80 transition-colors">
              <User className="w-5 h-5 text-slate-600" />
            </button>
            <button className="p-2 bg-white/50 rounded-full hover:bg-white/80 transition-colors relative">
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-pink-400 rounded-full animate-pulse"></span>
            </button>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-800 text-balance">
            สวัสดีคุณแม่ Sarah! 😊
          </h2>
          <p className="text-slate-500 mt-1 tabular-nums">
            วันนี้: สัปดาห์ที่ 24, วันที่ 3
          </p>
        </div>
      </header>

      {/* Main Progress Area */}
      <main className="px-6 flex flex-col gap-6 mt-2">
        <section className="flex flex-col items-center">
          <AnimatedRing week={24} daysToGo={116} />
        </section>

        {/* Baby Size - High Quality Asset */}
        <section className="flex flex-col mb-4 mt-2">
          <div className="relative w-full h-[220px] rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] group cursor-pointer border border-white/60">
            <img 
              src="/images/lemon.jpg" 
              alt="Baby is the size of a lemon" 
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
            />
            {/* Elegant dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent pointer-events-none" />
            
            <div className="absolute bottom-0 left-0 p-6 w-full flex flex-col pointer-events-none">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white/90 text-xs font-bold tracking-wider mb-2 w-fit border border-white/20">
                ขนาดสัปดาห์ที่ 24
              </span>
              <h3 className="text-white font-extrabold text-2xl drop-shadow-md tracking-tight mb-1">เท่าลูกเลมอน</h3>
              <div className="flex gap-3 text-sm text-white/80 font-medium">
                <span>ยาว ~30 ซม.</span>
                <span>•</span>
                <span>หนัก ~600 ก.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions with Framer Motion */}
        <section className="mt-8">
          <h3 className="font-semibold text-slate-800/90 mb-4 ml-1">เมนูลัด</h3>
          <div className="grid grid-cols-3 gap-4">
            <AnimatedCard
              title="บันทึกอาการ"
              subtitle="วันนี้: ปกติ"
              icon={PenSquare}
              colorClass="bg-pink-100/80"
              iconColorClass="text-pink-600"
              delay={0.1}
              onClick={() => setIsLoggerOpen(true)}
            />
            <AnimatedCard
              title="ตารางนัด"
              subtitle="18 ต.ค. 10:00"
              icon={Calendar}
              colorClass="bg-blue-100/80"
              iconColorClass="text-blue-600"
              delay={0.2}
            />
            <AnimatedCard
              title="ฉุกเฉิน"
              subtitle="เบอร์ติดต่อ"
              icon={AlertTriangle}
              colorClass="bg-red-100/80"
              iconColorClass="text-red-600"
              delay={0.3}
            />
          </div>
        </section>

        {/* Daily Tip */}
        <section className="mt-6 flex items-center justify-between p-5 bg-white/50 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm hover:bg-white/70 transition-all cursor-pointer active:scale-[0.98]">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-yellow-100/80 rounded-xl">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800/90">ทิปส์ประจำวัน</p>
              <p className="text-xs text-slate-600/80 mt-0.5">ดื่มน้ำให้เพียงพอ 8-10 แก้ว</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400/80" />
        </section>
      </main>

    </div>
  );
}
