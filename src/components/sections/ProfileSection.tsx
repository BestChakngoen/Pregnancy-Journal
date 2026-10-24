"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { User, Settings, LogOut, BellRing, KeyRound, CircleUserRound, ChevronRight } from "lucide-react";
import { useUserStore } from "@/lib/userStore";
import { useRouter } from "next/navigation";
import EditProfileModal from "@/components/modals/EditProfileModal";
import ChangePasswordModal from "@/components/modals/ChangePasswordModal";
import { useAlertStore } from "@/lib/alertStore";

export default function ProfileSection() {
  const { user, logout } = useUserStore();
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);

  const handleLogout = () => {
    useAlertStore.getState().showAlert({
      type: "warning",
      title: "ออกจากระบบ",
      message: "ต้องการออกจากระบบใช่หรือไม่?",
      confirmText: "ออกจากระบบ",
      showCancelButton: true,
      onConfirm: () => {
        logout();
        router.push("/login");
      }
    });
  };

  return (
    <div className="pb-28 pt-8 px-6 md:px-10 md:pt-12 min-h-svh flex flex-col relative overflow-hidden md:bg-transparent">
      
      <EditProfileModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
      />

      <ChangePasswordModal
        isOpen={isPasswordOpen}
        onClose={() => setIsPasswordOpen(false)}
      />

      {/* Header */}
      <header className="mb-8 flex items-center justify-between w-full max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">โปรไฟล์</h1>
        <button className="p-2 bg-white/60 border border-white/60 rounded-full shadow-sm text-slate-500 hover:text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2">
          <Settings className="w-6 h-6" />
        </button>
      </header>

      <main className="flex flex-col gap-6 flex-1 w-full max-w-3xl mx-auto">
        
        {/* User Card */}
        <section>
          <motion.div 
            whileHover={{ y: -2 }}
            className="w-full flex items-center gap-5 p-6 bg-gradient-to-br from-pink-100/80 to-blue-50/80 border border-white/60 rounded-[2rem] shadow-sm transition-all"
          >
            <div className="w-16 h-16 bg-white/60 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white/40">
              <CircleUserRound className="w-8 h-8 text-pink-500" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-xl font-bold text-slate-800/90 tracking-tight">แม่{user?.name || "ส้ม"}</h2>
              <p className="text-sm font-medium text-slate-600/80 mt-0.5">อายุ {user?.age || "28"} ปี • ท้องที่ {user?.gravida || "1"}</p>
            </div>
          </motion.div>
        </section>

        {/* Free-floating Menu List */}
        <section className="flex flex-col gap-3 mt-2">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center justify-between p-4 bg-white/50 border border-white/60 rounded-2xl shadow-sm hover:bg-white/70 transition-all active:scale-[0.98] group"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-blue-100/80 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
                <User className="w-5 h-5" />
              </div>
              <span className="font-semibold text-slate-700/90 text-sm">ข้อมูลส่วนตัว</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400/80 group-hover:text-slate-600 transition-colors group-hover:translate-x-1" />
          </button>
          
          <button
            onClick={() => setIsPasswordOpen(true)}
            className="flex items-center justify-between p-4 bg-white/50 border border-white/60 rounded-2xl shadow-sm hover:bg-white/70 transition-all active:scale-[0.98] group"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-emerald-100/80 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
                <KeyRound className="w-5 h-5" />
              </div>
              <span className="font-semibold text-slate-700/90 text-sm">เปลี่ยนรหัสผ่าน</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400/80 group-hover:text-slate-600 transition-colors group-hover:translate-x-1" />
          </button>

          <button className="flex items-center justify-between p-4 bg-white/50 border border-white/60 rounded-2xl shadow-sm hover:bg-white/70 transition-all active:scale-[0.98] group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2">
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
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-4 bg-red-50/80 rounded-2xl border border-red-200 text-red-500/90 font-semibold shadow-sm hover:bg-red-100 hover:text-red-600 transition-colors active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
          >
            <LogOut className="w-5 h-5" />
            ออกจากระบบ
          </button>
        </section>

      </main>
    </div>
  );
}
