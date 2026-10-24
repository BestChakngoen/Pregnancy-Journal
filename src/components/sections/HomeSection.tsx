"use client";

import { useState, useEffect } from "react";
import AnimatedRing from "@/components/ui/AnimatedRing";
import AnimatedCard from "@/components/ui/AnimatedCard";
import { useRouter } from "next/navigation";
import { AlertTriangle, Lightbulb, ChevronRight, User, Bell, Activity, Loader2 } from "lucide-react";
import BloodPressureLogger from "@/components/loggers/BloodPressureLogger";
import { useUserStore } from "@/lib/userStore";
import { currentUid } from "@/lib/firebase";

export default function HomeSection() {
  const router = useRouter();
  const [isBPLoggerOpen, setIsBPLoggerOpen] = useState(false);
  const { user, isLoaded, loginOrSaveUser, logout } = useUserStore();

  const handleEddChange = (newEdd: string) => {
    if (!user) return;
    let newWeeks = user.gestationalWeeks;
    if (newEdd) {
      const eddDate = new Date(newEdd);
      const today = new Date();
      eddDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      const diffTime = eddDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const daysElapsed = 280 - diffDays;
      let calculatedWeeks = Math.floor(daysElapsed / 7);
      calculatedWeeks = Math.max(1, Math.min(42, calculatedWeeks));
      newWeeks = calculatedWeeks.toString();
    }
    loginOrSaveUser({
      ...user,
      expectedDeliveryDate: newEdd,
      gestationalWeeks: newWeeks
    });
  };

  useEffect(() => {
    if (isLoaded && !user) {
      router.replace("/login");
    }
  }, [isLoaded, user, router]);

  // localStorage บอกแค่ว่าเคยล็อกอิน (แก้เองได้): ถ้าไม่มี session Firebase จริง เช่นหมดอายุหรือบัญชีเก่าที่ไม่มีรหัสผ่าน ให้ล็อกอินใหม่
  useEffect(() => {
    if (!user?.name) return;
    currentUid()
      .then((uid) => {
        if (!uid) {
          logout();
          router.replace("/login");
        }
      })
      .catch(() => {}); // โหลด auth ไม่ได้ (เช่นออฟไลน์) -> ไม่เตะออก
  }, [user?.name, router]);

  if (!isLoaded || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
      </div>
    );
  }

  return (
    <div className="pb-24">
      <BloodPressureLogger 
        isOpen={isBPLoggerOpen}
        onClose={() => setIsBPLoggerOpen(false)}
      />
      
      {/* Header */}
      <header className="flex flex-col gap-4 p-6 pb-2">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-blue-500 tracking-tight">MomSafe</h1>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push("/#profile")}
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
      <main className="px-6 flex flex-col md:grid md:grid-cols-12 md:gap-8 gap-8 mt-4 md:mt-8 md:px-10">
        <section className="flex flex-col items-center md:col-span-12 md:py-12 md:bg-white/40 md:rounded-[2.5rem] md:p-8 md:shadow-sm md:justify-center">
          <AnimatedRing week={Number(user.gestationalWeeks)} edd={user.expectedDeliveryDate} onEddChange={handleEddChange} />
        </section>

        {/* Quick Actions with Framer Motion */}
        <section className="md:col-span-8 md:row-start-2">
          <h3 className="font-semibold text-slate-800/90 mb-4 ml-1">เมนูลัด</h3>
          <div className="grid grid-cols-2 gap-3">
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
        <div className="md:col-span-4 md:row-start-2 flex flex-col gap-6 md:justify-end">
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
        </div>
      </main>

    </div>
  );
}
