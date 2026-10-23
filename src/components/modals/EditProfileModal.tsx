"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, User, CalendarDays, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import FloatingParticles from "@/components/ui/FloatingParticles";
import { useUserStore } from "@/lib/userStore";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useAlertStore } from "@/lib/alertStore";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { user, loginOrSaveUser } = useUserStore();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gestationalWeeks: "",
    gravida: "1",
  });

  // Load existing data when modal opens
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        name: user.name,
        age: user.age,
        gestationalWeeks: user.gestationalWeeks,
        gravida: user.gravida,
      });
    }
  }, [isOpen, user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    setIsSaving(true);
    
    try {
      const newProfile = {
        name: formData.name.trim(),
        age: formData.age,
        gestationalWeeks: formData.gestationalWeeks,
        gravida: formData.gravida,
      };

      // Attempt to save to Firebase
      const userRef = doc(db, "users", newProfile.name.toLowerCase());
      await setDoc(userRef, newProfile, { merge: true });
      
      // Update local state
      loginOrSaveUser(newProfile);

      setTimeout(() => {
        setIsSaving(false);
        onClose();
        useAlertStore.getState().showAlert({
          type: "success",
          title: "อัปเดตข้อมูลสำเร็จ",
          message: "ข้อมูลส่วนตัวของคุณแม่ถูกบันทึกเรียบร้อยแล้ว",
        });
      }, 800);
      
    } catch (err) {
      console.error("Error updating profile:", err);
      // Fallback: Save locally if Firebase fails
      const localProfile = {
        name: formData.name.trim(),
        age: formData.age,
        gestationalWeeks: formData.gestationalWeeks,
        gravida: formData.gravida,
      };
      loginOrSaveUser(localProfile);
      
      setTimeout(() => {
        setIsSaving(false);
        onClose();
        useAlertStore.getState().showAlert({
          type: "warning",
          title: "ใช้งานออฟไลน์",
          message: "บันทึกข้อมูลส่วนตัวในเครื่องของคุณแม่เรียบร้อยแล้ว (ขาดการเชื่อมต่อ)",
        });
      }, 800);
    }
  };

  const inputClasses = "w-full p-4 bg-slate-50/80 backdrop-blur-sm rounded-2xl border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-pink-300 shadow-inner";
  const labelClasses = "block text-sm font-semibold text-slate-600 mb-2 ml-1 flex items-center gap-2";

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto bg-white/95 backdrop-blur-xl rounded-t-[2rem] shadow-2xl z-50 flex flex-col max-h-[90vh] border-t border-white/60"
          >
            <div className="w-full flex justify-center pt-3 pb-2" onClick={onClose}>
              <div className="w-12 h-1.5 bg-slate-300/50 rounded-full" />
            </div>

            <div className="px-6 pb-2 pt-2 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-800">แก้ไขข้อมูลส่วนตัว</h2>
                <p className="text-sm text-slate-500 mt-1">อัปเดตข้อมูลของคุณแม่</p>
              </div>
              <button onClick={onClose} className="w-11 h-11 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors" aria-label="ปิด">
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSave} className="px-6 pt-4 pb-4 overflow-y-auto flex-1 flex flex-col gap-5">
              
              <div>
                <label className={labelClasses}>
                  <User className="w-4 h-4 text-pink-500" />
                  ชื่อของคุณแม่
                </label>
                <input
                  type="text"
                  required
                  className={inputClasses}
                  value={formData.name}
                  readOnly
                  title="ชื่อผูกกับบัญชี ไม่สามารถเปลี่ยนได้"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClasses}>อายุ (ปี)</label>
                  <input
                    type="number"
                    required
                    min="15"
                    max="60"
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
                    className={inputClasses}
                    value={formData.gestationalWeeks}
                    onChange={(e) => setFormData({ ...formData, gestationalWeeks: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className={labelClasses}>
                  <Activity className="w-4 h-4 text-pink-500" />
                  ตั้งครรภ์ครั้งที่เท่าไหร่
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

            </form>

            {/* Sticky Save Button */}
            <div className="p-6 pt-2 bg-white/95 backdrop-blur-md pb-safe shrink-0 relative overflow-hidden">
              {isSaving && <FloatingParticles count={15} />}
              <button 
                onClick={handleSave}
                disabled={isSaving}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-4 text-white rounded-2xl font-semibold shadow-lg transition-all",
                  isSaving ? "bg-emerald-500 shadow-emerald-500/20 scale-[0.98]" : "bg-slate-800 shadow-slate-800/20 active:scale-95"
                )}
              >
                {isSaving ? (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                    <Check className="w-5 h-5" />
                    อัปเดตสำเร็จ!
                  </motion.div>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    บันทึกการเปลี่ยนแปลง
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
