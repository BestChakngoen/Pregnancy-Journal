"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { useAlertStore } from "@/lib/alertStore";
import { cn } from "@/lib/utils";

export default function PopupAlert() {
  const { isOpen, options, closeAlert } = useAlertStore();

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

  const getButtonColor = () => {
    switch (options.type) {
      case "success": return "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30";
      case "error": return "bg-rose-500 hover:bg-rose-600 shadow-rose-500/30";
      case "warning": return "bg-amber-500 hover:bg-amber-600 shadow-amber-500/30";
      case "info": return "bg-blue-500 hover:bg-blue-600 shadow-blue-500/30";
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
              className="bg-white/95 backdrop-blur-2xl w-full max-w-sm rounded-[2rem] shadow-2xl border border-white/60 pointer-events-auto relative overflow-hidden flex flex-col items-center text-center p-8"
            >
              <button 
                onClick={closeAlert}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mb-5", getBgColor())}>
                {getIcon()}
              </div>

              <h3 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">
                {options.title}
              </h3>
              
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
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
