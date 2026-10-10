"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: BaseModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-4 right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl p-6 z-50 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-800">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface BPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (bp: string) => void;
}

export function BloodPressureModal({ isOpen, onClose, onSave }: BPModalProps) {
  const [sys, setSys] = useState("");
  const [dia, setDia] = useState("");

  const handleSave = () => {
    if (sys && dia) {
      onSave(`${sys}/${dia}`);
      setSys("");
      setDia("");
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="บันทึกความดันโลหิต">
      <div className="flex gap-4 items-center justify-center mb-6">
        <div className="flex flex-col gap-1 w-full">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-2">Systolic (ตัวบน)</label>
          <input
            type="number"
            value={sys}
            onChange={(e) => setSys(e.target.value)}
            placeholder="120"
            className="w-full text-center text-3xl font-bold text-slate-800 py-3 rounded-2xl bg-white/50 border-2 border-slate-100 focus:border-blue-400 focus:ring-0 transition-colors placeholder:text-slate-300"
          />
        </div>
        <span className="text-3xl text-slate-300 font-light mt-5">/</span>
        <div className="flex flex-col gap-1 w-full">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider pl-2">Diastolic (ตัวล่าง)</label>
          <input
            type="number"
            value={dia}
            onChange={(e) => setDia(e.target.value)}
            placeholder="80"
            className="w-full text-center text-3xl font-bold text-slate-800 py-3 rounded-2xl bg-white/50 border-2 border-slate-100 focus:border-blue-400 focus:ring-0 transition-colors placeholder:text-slate-300"
          />
        </div>
      </div>
      <button
        onClick={handleSave}
        disabled={!sys || !dia}
        className={cn(
          "w-full py-4 rounded-2xl font-semibold text-white transition-all shadow-sm active:scale-95",
          sys && dia ? "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20" : "bg-slate-300 cursor-not-allowed"
        )}
      >
        บันทึกข้อมูล
      </button>
    </Modal>
  );
}

interface WeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (weight: number) => void;
}

export function WeightModal({ isOpen, onClose, onSave }: WeightModalProps) {
  const [weight, setWeight] = useState("");

  const handleSave = () => {
    if (weight) {
      onSave(parseFloat(weight));
      setWeight("");
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="บันทึกน้ำหนัก">
      <div className="flex flex-col gap-1 w-full mb-6 relative">
        <input
          type="number"
          step="0.1"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="55.0"
          className="w-full text-center text-4xl font-extrabold text-slate-800 py-4 pr-12 rounded-2xl bg-white/50 border-2 border-slate-100 focus:border-amber-400 focus:ring-0 transition-colors placeholder:text-slate-300"
        />
        <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">kg</span>
      </div>
      <button
        onClick={handleSave}
        disabled={!weight}
        className={cn(
          "w-full py-4 rounded-2xl font-semibold text-white transition-all shadow-sm active:scale-95",
          weight ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20" : "bg-slate-300 cursor-not-allowed"
        )}
      >
        บันทึกข้อมูล
      </button>
    </Modal>
  );
}
