"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, Baby, User, CalendarDays, Activity, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/lib/userStore";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function Onboarding() {
  const router = useRouter();
  const { loginOrSaveUser } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gestationalWeeks: "",
    gravida: "1",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    setIsLoading(true);
    
    try {
      const userRef = doc(db, "users", formData.name.trim().toLowerCase());
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        // ถ้ายูสเซอร์มีอยู่แล้ว แปลว่าเข้าสู่ระบบบัญชีเดิม
        const userData = userSnap.data();
        loginOrSaveUser({
          name: userData.name,
          age: userData.age,
          gestationalWeeks: userData.gestationalWeeks,
          gravida: userData.gravida,
        });
        alert(`ยินดีต้อนรับกลับมาค่ะ คุณแม่${userData.name}!`);
      } else {
        // ถ้ายังไม่มี ให้สร้างใหม่
        const newProfile = {
          name: formData.name.trim(),
          age: formData.age,
          gestationalWeeks: formData.gestationalWeeks,
          gravida: formData.gravida,
          createdAt: new Date().toISOString()
        };
        await setDoc(userRef, newProfile);
        
        loginOrSaveUser({
          name: newProfile.name,
          age: newProfile.age,
          gestationalWeeks: newProfile.gestationalWeeks,
          gravida: newProfile.gravida,
        });
        alert(`สร้างโปรไฟล์สำเร็จ! ยินดีต้อนรับคุณแม่${newProfile.name}ค่ะ`);
      }
      
      router.push("/");
    } catch (error) {
      console.error("Error saving user:", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล โปรดตรวจสอบการตั้งค่า Firebase");
    } finally {
      setIsLoading(false);
    }
  };

  const inputClasses = "w-full p-4 bg-white/60 backdrop-blur-sm border border-white/80 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all shadow-sm";
  const labelClasses = "block text-sm font-semibold text-slate-700/90 mb-2 ml-1 flex items-center gap-2";

  return (
    <div className="min-h-dvh flex flex-col pt-12 pb-8 px-6 relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-pink-200/40 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200/40 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/3" />

      <header className="mb-8">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="w-full h-56 rounded-[2rem] overflow-hidden shadow-sm mb-6 relative"
        >
          <img src="/images/mother.jpg" alt="Pregnant mother illustration" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-pink-100/40 to-transparent mix-blend-overlay" />
        </motion.div>
        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl font-bold text-slate-800 tracking-tight text-balance"
        >
          ยินดีต้อนรับสู่ Bumply
        </motion.h1>
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-500 mt-2"
        >
          ขอข้อมูลเล็กน้อย เพื่อให้เราช่วยดูแลคุณแม่และลูกน้อยได้อย่างแม่นยำที่สุด
        </motion.p>
      </header>

      <motion.form 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        onSubmit={handleSubmit} 
        className="flex-1 flex flex-col gap-6"
      >
        <div>
          <label className={labelClasses}>
            <User className="w-4 h-4 text-pink-500" />
            ชื่อของคุณแม่ (หรือชื่อเล่น)
          </label>
          <input
            type="text"
            required
            placeholder="เช่น แม่ส้ม, Sarah"
            className={inputClasses}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClasses}>
              อายุ (ปี)
            </label>
            <input
              type="number"
              required
              min="15"
              max="60"
              placeholder="เช่น 28"
              className={inputClasses}
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClasses}>
              <CalendarDays className="w-4 h-4 text-pink-500" />
              อายุครรภ์ (สัปดาห์)
            </label>
            <input
              type="number"
              required
              min="1"
              max="42"
              placeholder="เช่น 24"
              className={inputClasses}
              value={formData.gestationalWeeks}
              onChange={(e) => setFormData({ ...formData, gestationalWeeks: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className={labelClasses}>
            <Activity className="w-4 h-4 text-pink-500" />
            ตั้งครรภ์ครั้งที่เท่าไหร่ (Gravida)
          </label>
          <select
            className={cn(inputClasses, "appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_1rem_center] bg-[length:1.5em_1.5em] pr-10")}
            value={formData.gravida}
            onChange={(e) => setFormData({ ...formData, gravida: e.target.value })}
          >
            <option value="1">ท้องแรก (1)</option>
            <option value="2">ท้องที่ 2</option>
            <option value="3">ท้องที่ 3</option>
            <option value="4">ท้องที่ 4 ขึ้นไป</option>
          </select>
        </div>

        <div className="mt-auto pt-8">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-4 bg-slate-800 text-white rounded-2xl font-semibold shadow-xl shadow-slate-800/20 hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                กำลังโหลด...
              </>
            ) : (
              <>
                เริ่มใช้งาน Bumply
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
}
