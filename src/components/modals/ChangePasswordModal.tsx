"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, KeyRound, Loader2 } from "lucide-react";
import { auth } from "@/lib/firebase";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { useAlertStore } from "@/lib/alertStore";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const errorMessage = (code: string) => {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
      return "รหัสผ่านปัจจุบันไม่ถูกต้อง";
    case "auth/weak-password":
      return "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร";
    case "auth/too-many-requests":
      return "ลองหลายครั้งเกินไป กรุณารอสักครู่แล้วลองใหม่";
    case "auth/network-request-failed":
      return "ไม่สามารถเชื่อมต่ออินเทอร์เน็ตได้";
    default:
      return "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง";
  }
};

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleClose = () => {
    setCurrent("");
    setNext("");
    setConfirm("");
    setError("");
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (next !== confirm) {
      setError("รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }

    const fbUser = auth.currentUser;
    if (!fbUser?.email) {
      setError("บัญชีนี้ยังไม่ได้ผูกกับรหัสผ่าน กรุณาออกจากระบบแล้วสมัครใช้งานใหม่");
      return;
    }

    setIsSaving(true);
    try {
      // Firebase บังคับยืนยันตัวตนซ้ำก่อนเปลี่ยนรหัสผ่าน
      await reauthenticateWithCredential(fbUser, EmailAuthProvider.credential(fbUser.email, current));
      await updatePassword(fbUser, next);
      handleClose();
      useAlertStore.getState().showAlert({
        type: "success",
        title: "เปลี่ยนรหัสผ่านสำเร็จ",
        message: "ใช้รหัสผ่านใหม่ในการเข้าสู่ระบบครั้งต่อไป",
      });
    } catch (err) {
      console.error("Error changing password:", err);
      setError(errorMessage((err as { code?: string }).code ?? ""));
    } finally {
      setIsSaving(false);
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
            onClick={handleClose}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto bg-white/95 backdrop-blur-xl rounded-t-[2rem] shadow-2xl z-50 flex flex-col max-h-[90vh] border-t border-white/60"
          >
            <div className="w-full flex justify-center pt-3 pb-2" onClick={handleClose}>
              <div className="w-12 h-1.5 bg-slate-300/50 rounded-full" />
            </div>

            <div className="px-6 pb-2 pt-2 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-800">เปลี่ยนรหัสผ่าน</h2>
                <p className="text-sm text-slate-500 mt-1">ต้องใส่รหัสผ่านปัจจุบันเพื่อยืนยันตัวตน</p>
              </div>
              <button onClick={handleClose} className="w-11 h-11 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors" aria-label="ปิด">
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pt-4 pb-6 pb-safe overflow-y-auto flex flex-col gap-5">
              <div>
                <label htmlFor="current-password" className={labelClasses}>
                  <KeyRound className="w-4 h-4 text-pink-500" />
                  รหัสผ่านปัจจุบัน
                </label>
                <input
                  id="current-password"
                  type="password" required autoComplete="current-password"
                  className={inputClasses}
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="new-password" className={labelClasses}>
                  <KeyRound className="w-4 h-4 text-pink-500" />
                  รหัสผ่านใหม่
                </label>
                <input
                  id="new-password"
                  type="password" required minLength={6} autoComplete="new-password"
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  className={inputClasses}
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="confirm-password" className={labelClasses}>
                  <KeyRound className="w-4 h-4 text-pink-500" />
                  ยืนยันรหัสผ่านใหม่
                </label>
                <input
                  id="confirm-password"
                  type="password" required minLength={6} autoComplete="new-password"
                  className={inputClasses}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>

              {error && (
                <p role="alert" className="text-red-500 text-sm font-medium ml-1">{error}</p>
              )}

              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-2 py-4 bg-slate-800 text-white rounded-2xl font-semibold shadow-lg shadow-slate-800/20 active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    เปลี่ยนรหัสผ่าน
                  </>
                )}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
