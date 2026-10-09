"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, PhoneCall, X } from "lucide-react";

interface RedFlagAlertProps {
  isOpen: boolean;
  onClose: () => void;
  symptomName: string;
}

export default function RedFlagAlert({ isOpen, onClose, symptomName }: RedFlagAlertProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          
          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center px-4 z-[101] pointer-events-none">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ 
                type: "spring", 
                damping: 15, 
                stiffness: 300,
                mass: 0.8
              }}
              className="bg-red-50 w-full max-w-sm rounded-[2rem] p-6 shadow-2xl border border-red-100 pointer-events-auto relative overflow-hidden"
            >
              {/* Top accent line */}
              <div className="absolute top-0 left-0 w-full h-2 bg-red-400" />
              
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 bg-white/50 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center mt-2">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 text-red-500 animate-pulse">
                  <AlertTriangle className="w-8 h-8" />
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 mb-2">
                  พบสัญญาณเฝ้าระวัง!
                </h3>
                
                <p className="text-slate-600/90 text-sm mb-6 leading-relaxed">
                  อาการ <span className="font-semibold text-red-500">"{symptomName}"</span> อาจเป็นสัญญาณอันตราย กรุณาติดต่อแพทย์หรือไปโรงพยาบาลทันที
                </p>

                <div className="flex flex-col gap-3 w-full">
                  <button className="flex items-center justify-center gap-2 w-full py-3.5 bg-red-500 text-white rounded-2xl font-semibold shadow-lg shadow-red-500/30 hover:bg-red-600 active:scale-95 transition-all">
                    <PhoneCall className="w-5 h-5" />
                    โทรด่วน: โรงพยาบาล
                  </button>
                  <button className="flex items-center justify-center gap-2 w-full py-3.5 bg-white text-slate-700 rounded-2xl font-medium shadow-sm border border-slate-200 hover:bg-slate-50 active:scale-95 transition-all">
                    <PhoneCall className="w-5 h-5" />
                    โทรด่วน: สามี/ญาติ
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
