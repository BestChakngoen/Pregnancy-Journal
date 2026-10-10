"use client";

import { useState, useEffect } from "react";
import AnimatedRing from "@/components/ui/AnimatedRing";
import AnimatedCard from "@/components/ui/AnimatedCard";
import SymptomLogger from "@/components/loggers/SymptomLogger";
import RedFlagAlert from "@/components/ui/RedFlagAlert";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PenSquare, Calendar, AlertTriangle, Lightbulb, ChevronRight, User, Bell, Home, Activity, BookOpen, Loader2 } from "lucide-react";
import BloodPressureLogger from "@/components/loggers/BloodPressureLogger";
import { useUserStore } from "@/lib/userStore";

export default function Dashboard() {
  const router = useRouter();
  const [isLoggerOpen, setIsLoggerOpen] = useState(false);
  const [isBPLoggerOpen, setIsBPLoggerOpen] = useState(false);
  const [redFlagSymptom, setRedFlagSymptom] = useState<string | null>(null);
  const { user, isLoaded } = useUserStore();

  useEffect(() => {
    if (isLoaded && !user) {
      router.replace("/onboarding");
    }
  }, [isLoaded, user, router]);

  const handleRedFlagTrigger = (symptomName: string) => {
    setIsLoggerOpen(false); // Close logger
    setTimeout(() => {
      setRedFlagSymptom(symptomName); // Open alert after a tiny delay for smooth animation
    }, 300);
  };

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="pb-24">
      <SymptomLogger 
        isOpen={isLoggerOpen} 
        onClose={() => setIsLoggerOpen(false)} 
        onRedFlagTrigger={handleRedFlagTrigger}
      />

      <BloodPressureLogger 
        isOpen={isBPLoggerOpen}
        onClose={() => setIsBPLoggerOpen(false)}
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
            <button 
              onClick={() => router.push("/profile")}
              className="w-11 h-11 flex items-center justify-center bg-white/50 rounded-full hover:bg-white/80 transition-colors"
              aria-label="โปรไฟล์"
            >
              <User className="w-5 h-5 text-slate-600" aria-hidden="true" />
            </button>
            <button className="w-11 h-11 flex items-center justify-center bg-white/50 rounded-full hover:bg-white/80 transition-colors relative" aria-label="การแจ้งเตือน">
              <Bell className="w-5 h-5 text-slate-600" aria-hidden="true" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-pink-400 rounded-full animate-pulse"></span>
            </button>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-800 text-balance">
            สวัสดีคุณแม่ {user.name}! 😊
          </h2>
          <p className="text-slate-500 mt-1 tabular-nums">
            วันนี้: สัปดาห์ที่ {user.gestationalWeeks}
          </p>
        </div>
      </header>

      {/* Main Progress Area */}
      <main className="px-6 flex flex-col gap-8 mt-4">
        <section className="flex flex-col items-center">
          <AnimatedRing week={Number(user.gestationalWeeks)} daysToGo={280 - (Number(user.gestationalWeeks) * 7)} />
        </section>

        {/* Baby Size - High Quality Asset */}
        <section className="flex flex-col">
          <div className="relative w-full h-[220px] rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.08)] group cursor-pointer">
            <Image 
              src="/images/lemon.jpg" 
              alt={`Baby size at week ${user.gestationalWeeks}`} 
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
            />
            {/* Elegant dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent pointer-events-none" />
            
            <div className="absolute bottom-0 left-0 p-6 w-full flex flex-col pointer-events-none">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white/90 text-xs font-bold tracking-wider mb-2 w-fit border border-white/20">
                ขนาดสัปดาห์ที่ {user.gestationalWeeks}
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
        <section>
          <h3 className="font-semibold text-slate-800/90 mb-4 ml-1">เมนูลัด</h3>
          <div className="grid grid-cols-2 gap-3">
            <AnimatedCard
              title="บันทึกอาการ"
              subtitle="วันนี้: ปกติ"
              icon={PenSquare}
              colorClass="bg-pink-100"
              iconColorClass="text-pink-600"
              delay={0.1}
              onClick={() => setIsLoggerOpen(true)}
            />
            <AnimatedCard
              title="ความดัน"
              subtitle="บันทึกค่า"
              icon={Activity}
              colorClass="bg-indigo-100"
              iconColorClass="text-indigo-600"
              delay={0.15}
              onClick={() => setIsBPLoggerOpen(true)}
            />
            <AnimatedCard
              title="ตารางนัด"
              subtitle="18 ต.ค."
              icon={Calendar}
              colorClass="bg-blue-100"
              iconColorClass="text-blue-600"
              delay={0.2}
              onClick={() => router.push("/tracking")}
            />
            <AnimatedCard
              title="ฉุกเฉิน"
              subtitle="1669"
              icon={AlertTriangle}
              colorClass="bg-red-100"
              iconColorClass="text-red-600"
              delay={0.3}
              onClick={() => { window.location.href = "tel:1669"; }}
            />
          </div>
        </section>

        {/* Daily Tip */}
        <section className="flex items-center justify-between p-5 bg-gradient-to-r from-yellow-50 to-orange-50/30 border border-white/60 backdrop-blur-md rounded-[1.5rem] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:brightness-95 transition-all cursor-pointer active:scale-[0.98]">
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
