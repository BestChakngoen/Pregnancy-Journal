"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Symptom {
  id: string;
  label: string;
  emoji: string;
  isRedFlag: boolean;
}

const SYMPTOMS: Symptom[] = [
  { id: "nausea", label: "แพ้ท้อง", emoji: "🤢", isRedFlag: false },
  { id: "headache", label: "ปวดหัว", emoji: "🤕", isRedFlag: false },
  { id: "backache", label: "ปวดหลัง", emoji: "💥", isRedFlag: false },
  { id: "fatigue", label: "อ่อนเพลีย", emoji: "🥱", isRedFlag: false },
  { id: "bleeding", label: "เลือดออก", emoji: "🩸", isRedFlag: true },
  { id: "severe_pain", label: "ปวดท้องเกร็ง", emoji: "⚡", isRedFlag: true },
  { id: "less_movement", label: "ลูกดิ้นน้อยลง", emoji: "🛑", isRedFlag: true },
  { id: "fluid", label: "น้ำเดิน", emoji: "💧", isRedFlag: true },
];

interface SymptomLoggerProps {
  isOpen: boolean;
  onClose: () => void;
  onRedFlagTrigger: (symptomName: string) => void;
}

export default function SymptomLogger({ isOpen, onClose, onRedFlagTrigger }: SymptomLoggerProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const normalSymptoms = SYMPTOMS.filter(s => !s.isRedFlag);
  const redFlagSymptoms = SYMPTOMS.filter(s => s.isRedFlag);

  const toggleSymptom = (symptom: Symptom) => {
    if (symptom.isRedFlag) {
      onRedFlagTrigger(symptom.label);
      return;
    }

    const next = new Set(selectedIds);
    if (next.has(symptom.id)) {
      next.delete(symptom.id);
    } else {
      next.add(symptom.id);
    }
    setSelectedIds(next);
  };

  const handleSave = () => {
    setSelectedIds(new Set());
    onClose();
  };

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
            className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto bg-white/95 backdrop-blur-xl rounded-t-[2rem] shadow-2xl border-t border-white z-50 flex flex-col max-h-[85vh]"
          >
            <div className="w-full flex justify-center pt-3 pb-2" onClick={onClose}>
              <div className="w-12 h-1.5 bg-slate-300/50 rounded-full" />
            </div>

            <div className="px-6 pb-2 pt-2 flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-xl font-bold text-slate-800">บันทึกอาการวันนี้</h2>
                <p className="text-sm text-slate-500 mt-1">แตะเพื่อเลือกอาการที่คุณแม่เป็น</p>
              </div>
              <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 pt-4 pb-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3 mb-6">
                {normalSymptoms.map((s) => {
                  const isSelected = selectedIds.has(s.id);
                  return (
                    <motion.button
                      key={s.id}
                      onClick={() => toggleSymptom(s)}
                      whileTap={{ scale: 0.95 }}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-2xl border transition-colors text-left",
                        isSelected 
                          ? "bg-pink-100 border-pink-200 shadow-inner" 
                          : "bg-white border-slate-100 shadow-sm hover:bg-slate-50"
                      )}
                    >
                      <span className="text-2xl">{s.emoji}</span>
                      <span className={cn(
                        "font-medium text-sm",
                        isSelected ? "text-pink-700" : "text-slate-700"
                      )}>
                        {s.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Red Flags Section */}
              <div className="bg-red-50/50 rounded-2xl p-4 border border-red-100">
                <h3 className="text-sm font-semibold text-red-600 mb-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  อาการเฝ้าระวัง (แจ้งแพทย์)
                </h3>
                <div className="flex flex-col gap-2">
                  {redFlagSymptoms.map((s) => (
                    <motion.button
                      key={s.id}
                      onClick={() => toggleSymptom(s)}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center justify-between p-3 bg-white border border-red-100 rounded-xl hover:bg-red-50 transition-colors text-left group shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{s.emoji}</span>
                        <span className="font-medium text-sm text-red-700">
                          {s.label}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-red-300 group-hover:text-red-500 transition-colors" />
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Sticky Save Button */}
            <div className="p-6 pt-4 bg-white/95 backdrop-blur-md border-t border-slate-100 pb-safe shrink-0">
              <button 
                onClick={handleSave}
                className="w-full flex items-center justify-center gap-2 py-4 bg-slate-800 text-white rounded-2xl font-semibold shadow-lg shadow-slate-800/20 active:scale-95 transition-transform"
              >
                <Check className="w-5 h-5" />
                บันทึกอาการ ({selectedIds.size})
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
