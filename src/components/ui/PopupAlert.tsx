"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { useAlertStore } from "@/lib/alertStore";
import { cn } from "@/lib/utils";

export default function PopupAlert() {
  const { isOpen, options, closeAlert } = useAlertStore();

  // Esc = ยกเลิก (เหมือนกดปิด)
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeAlert();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, closeAlert]);

  if (!options) return null;

  const handleConfirm = () => {
    if (options.onConfirm) {
      options.onConfirm();
    }
    closeAlert();
  };

  const getIcon = () => {
    switch (options.type) {
      case "success": return <CheckCircle2 className="w-12 h-12 text-emerald-500" />;
      case "error": return <XCircle className="w-12 h-12 text-rose-500" />;
      case "warning": return <AlertTriangle className="w-12 h-12 text-amber-500" />;
      case "info": return <Info className="w-12 h-12 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (options.type) {
      case "success": return "bg-emerald-50";
      case "error": return "bg-rose-50";
      case "warning": return "bg-amber-50";
      case "info": return "bg-blue-50";
    }
  };

  // ตัวอักษรขาวบนปุ่ม: เฉด -500 เดิมได้แค่ 2.1–3.7:1 จึงใช้เฉดเข้มที่ผ่าน 4.5:1
  const getButtonColor = () => {
    switch (options.type) {
      case "success": return "bg-emerald-700 hover:bg-emerald-800 shadow-emerald-700/30";
      case "error": return "bg-rose-600 hover:bg-rose-700 shadow-rose-600/30";
      case "warning": return "bg-amber-700 hover:bg-amber-800 shadow-amber-700/30";
      case "info": return "bg-blue-600 hover:bg-blue-700 shadow-blue-600/30";
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[100]"
            onClick={closeAlert}
          />
          <div className="fixed inset-0 flex items-center justify-center px-6 z-[101] pointer-events-none">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="popup-alert-title"
              aria-describedby="popup-alert-message"
              className="bg-white/95 backdrop-blur-2xl w-full max-w-sm rounded-[2rem] shadow-2xl border border-white/60 pointer-events-auto relative overflow-hidden flex flex-col items-center text-center p-8"
            >
              <button
                onClick={closeAlert}
                aria-label="ปิด"
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-700 bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>

              <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mb-5", getBgColor())}>
                {getIcon()}
              </div>

              <h3 id="popup-alert-title" className="text-2xl font-bold text-slate-800 tracking-tight mb-2">
                {options.title}
              </h3>

              <p id="popup-alert-message" className="text-slate-500 text-sm mb-8 leading-relaxed">
                {options.message}
              </p>

              <div className="flex gap-3 w-full">
                {options.showCancelButton && (
                  <button 
                    onClick={closeAlert}
                    className="w-full py-4 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl font-semibold shadow-sm active:scale-95 transition-all"
                  >
                    {options.cancelText || "ยกเลิก"}
                  </button>
                )}
                <button
                  autoFocus
                  onClick={handleConfirm}
                  className={cn(
                    "w-full py-4 text-white rounded-2xl font-semibold shadow-lg active:scale-95 transition-all",
                    getButtonColor()
                  )}
                >
                  {options.confirmText || "ตกลง"}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
