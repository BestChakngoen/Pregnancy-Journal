"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

import FloatingParticles from "@/components/ui/FloatingParticles";
import { ASSESSMENT_QUESTIONS as QUESTIONS, riskLevelOf } from "@/lib/questions";
import { saveResult } from "@/lib/saveResult";


export default function Assessment() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const totalSteps = QUESTIONS.length;
  const progressPercent = ((currentStep) / totalSteps) * 100;

  const handleAnswer = (val: boolean) => {
    const nextAnswers = { ...answers, [QUESTIONS[currentStep].id]: val };
    setAnswers(nextAnswers);
    setIsAdvancing(true);
    
    if (timerRef.current) clearTimeout(timerRef.current);
    
    // Auto proceed with visual delay
    timerRef.current = setTimeout(() => {
      setIsAdvancing(false);
      if (currentStep < totalSteps - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        const factors = QUESTIONS.filter((q) => nextAnswers[q.id]).map((q) => q.id);
        const totalRisk = QUESTIONS.reduce((sum, q) => sum + (nextAnswers[q.id] ? q.riskScore : 0), 0);
        // ส่งให้หน้า admin วิเคราะห์ (เก็บครั้งแรก + ครั้งล่าสุด) — บันทึกไม่ได้ก็ยังแสดงผลให้ผู้ใช้ตามปกติ
        saveResult("assessment", { totalRisk, level: riskLevelOf(totalRisk), factors, at: new Date().toISOString() })
          .catch((err) => console.error("Error saving assessment:", err));
        setIsFinished(true);
      }
    }, 150);
  };

  const handleBack = () => {
    setIsAdvancing(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const calculateRisk = () => {
    let totalRisk = 0;
    const riskDetails: string[] = [];

    QUESTIONS.forEach((q) => {
      if (answers[q.id]) {
        totalRisk += q.riskScore;
        riskDetails.push(q.title);
      }
    });

    let level = "ความเสี่ยงต่ำ";
    let color = "text-emerald-500";
    let bg = "bg-emerald-50";
    let icon = <CheckCircle2 className="w-12 h-12 text-emerald-500" />;

    const risk = riskLevelOf(totalRisk);
    if (risk === "high") {
      level = "ความเสี่ยงสูง (ควรพบแพทย์)";
      color = "text-red-500";
      bg = "bg-red-50";
      icon = <AlertTriangle className="w-12 h-12 text-red-500" />;
    } else if (risk === "medium") {
      level = "ความเสี่ยงปานกลาง";
      color = "text-amber-500";
      bg = "bg-amber-50";
      icon = <AlertTriangle className="w-12 h-12 text-amber-500" />;
    }

    return { totalRisk, level, color, bg, icon, riskDetails };
  };

  if (isFinished) {
    const result = calculateRisk();
    return (
      <div className="h-dvh overflow-hidden flex flex-col bg-slate-50 pt-12 short:pt-6 pb-8 short:pb-4 px-6 md:max-w-2xl md:mx-auto md:w-full md:shadow-sm">
        {result.totalRisk < 2 && <FloatingParticles count={20} />}
        <h1 className="text-2xl font-bold text-slate-800 text-center mb-8 short:mb-4">สรุปผลการประเมิน</h1>
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn("rounded-3xl p-8 short:p-5 flex flex-col items-center text-center shadow-sm ", result.bg)}
        >
          {result.icon}
          <h2 className={cn("text-2xl font-bold mt-4 mb-1", result.color)}>{result.level}</h2>
          <p className="text-slate-600/90 font-medium">คะแนนความเสี่ยงสะสม: {result.totalRisk} คะแนน</p>
        </motion.div>

        {result.riskDetails.length > 0 && (
          <div className="mt-8 short:mt-4 min-h-0 overflow-y-auto">
            <h3 className="font-semibold text-slate-800/90 mb-3 ml-1">ปัจจัยเสี่ยงที่พบ:</h3>
            <ul className="flex flex-col gap-2">
              {result.riskDetails.map((detail, idx) => (
                <li key={idx} className="bg-white/60 backdrop-blur-sm p-4 rounded-xl flex items-center gap-3 shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-slate-700 text-sm font-medium">{detail}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-auto pt-8 short:pt-4">
          <button
            onClick={() => router.push("/")}
            className="w-full flex items-center justify-center gap-2 py-4 bg-slate-800 text-white rounded-2xl font-semibold shadow-xl shadow-slate-800/20 active:scale-95 transition-all"
          >
            กลับสู่หน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  const currentQ = QUESTIONS[currentStep];

  return (
    <div className="h-dvh flex flex-col pt-safe pb-6 short:pb-3 relative overflow-hidden bg-slate-50 md:max-w-2xl md:mx-auto md:w-full md:shadow-sm">
      {/* Header & Progress */}
      <header className="px-4 py-4 short:py-1 flex items-center justify-between z-10 bg-slate-50/80 backdrop-blur-md">
        <button onClick={handleBack} className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors" aria-label="ย้อนกลับ">
          <ChevronLeft className="w-6 h-6" aria-hidden="true" />
        </button>
        <div className="text-sm font-semibold text-slate-500 tabular-nums tracking-wide">
          ข้อ {currentStep + 1} / {totalSteps}
        </div>
        <div className="w-10" /> {/* Spacer for centering */}
      </header>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-slate-100">
        <motion.div 
          className="h-full bg-pink-400 rounded-r-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Question Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-6 flex flex-col relative mt-6 short:mt-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="flex flex-col"
          >
            <h2 className="text-pink-500 font-semibold mb-2">{currentQ.title}</h2>
            <h3 className="text-2xl short:text-xl phone-landscape:text-lg font-bold text-slate-800 leading-snug text-balance">
              {currentQ.text}
            </h3>

            <div className="mt-12 short:mt-5 flex flex-col gap-4 short:gap-3 phone-landscape:grid phone-landscape:grid-cols-2">
              <button
                onClick={() => handleAnswer(true)}
                className={cn(
                  "w-full py-5 short:py-3.5 px-6 rounded-2xl bg-white shadow-sm text-left font-semibold text-slate-800 hover:bg-pink-50 hover:text-pink-900 active:scale-[0.98] transition-all flex items-center justify-between group relative overflow-hidden",
                  answers[currentQ.id] === true && "bg-pink-50 text-pink-900"
                )}
              >
                <span className="relative z-10 flex items-center justify-between w-full">
                  ใช่
                  <ArrowRight className={cn("w-5 h-5 text-slate-300 group-hover:text-pink-400", answers[currentQ.id] === true && "text-pink-500")} />
                </span>
                {answers[currentQ.id] === true && isAdvancing && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.15, ease: "linear" }}
                    className="absolute bottom-0 left-0 h-1.5 bg-pink-400/50"
                  />
                )}
              </button>
              <button
                onClick={() => handleAnswer(false)}
                className={cn(
                  "w-full py-5 short:py-3.5 px-6 rounded-2xl bg-white shadow-sm text-left font-semibold text-slate-800 hover:bg-blue-50 hover:text-blue-900 active:scale-[0.98] transition-all flex items-center justify-between group relative overflow-hidden",
                  answers[currentQ.id] === false && "bg-blue-50 text-blue-900"
                )}
              >
                <span className="relative z-10 flex items-center justify-between w-full">
                  ไม่ใช่
                  <ArrowRight className={cn("w-5 h-5 text-slate-300 group-hover:text-blue-400", answers[currentQ.id] === false && "text-blue-500")} />
                </span>
                {answers[currentQ.id] === false && isAdvancing && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.15, ease: "linear" }}
                    className="absolute bottom-0 left-0 h-1.5 bg-blue-400/50"
                  />
                )}
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
