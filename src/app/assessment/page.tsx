"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

import FloatingParticles from "@/components/ui/FloatingParticles";

// Mock Questions for demonstration
const QUESTIONS = [
  {
    id: 1,
    title: "อายุของคุณแม่",
    text: "ปัจจุบันคุณแม่อายุน้อยกว่า 18 ปี หรือ มากกว่า 35 ปี ใช่หรือไม่?",
    riskScore: 2,
  },
  {
    id: 2,
    title: "โรคประจำตัว",
    text: "คุณแม่มีโรคประจำตัว เช่น เบาหวาน ความดันโลหิตสูง โรคหัวใจ หรือไทรอยด์ หรือไม่?",
    riskScore: 3,
  },
  {
    id: 3,
    title: "ประวัติการตั้งครรภ์",
    text: "เคยมีประวัติแท้งบุตร คลอดก่อนกำหนด หรือครรภ์เป็นพิษในอดีตหรือไม่?",
    riskScore: 3,
  },
  {
    id: 4,
    title: "ครรภ์แฝด",
    text: "ปัจจุบันแพทย์วินิจฉัยว่าตั้งครรภ์แฝด ใช่หรือไม่?",
    riskScore: 2,
  },
  {
    id: 5,
    title: "อาการแทรกซ้อน",
    text: "มีอาการเลือดออกทางช่องคลอดในขณะตั้งครรภ์ปัจจุบันหรือไม่?",
    riskScore: 4,
  },
];

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
    setAnswers((prev) => ({ ...prev, [QUESTIONS[currentStep].id]: val }));
    setIsAdvancing(true);
    
    if (timerRef.current) clearTimeout(timerRef.current);
    
    // Auto proceed with visual delay
    timerRef.current = setTimeout(() => {
      setIsAdvancing(false);
      if (currentStep < totalSteps - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
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

    if (totalRisk >= 5) {
      level = "ความเสี่ยงสูง (ควรพบแพทย์)";
      color = "text-red-500";
      bg = "bg-red-50";
      icon = <AlertTriangle className="w-12 h-12 text-red-500" />;
    } else if (totalRisk >= 2) {
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
      <div className="min-h-dvh flex flex-col bg-slate-50 pt-12 pb-8 px-6">
        {result.totalRisk < 2 && <FloatingParticles count={20} />}
        <h1 className="text-2xl font-bold text-slate-800 text-center mb-8">สรุปผลการประเมิน</h1>
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn("rounded-3xl p-8 flex flex-col items-center text-center shadow-sm ", result.bg)}
        >
          {result.icon}
          <h2 className={cn("text-2xl font-bold mt-4 mb-1", result.color)}>{result.level}</h2>
          <p className="text-slate-600/90 font-medium">คะแนนความเสี่ยงสะสม: {result.totalRisk} คะแนน</p>
        </motion.div>

        {result.riskDetails.length > 0 && (
          <div className="mt-8">
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

        <div className="mt-auto pt-8">
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
    <div className="min-h-dvh flex flex-col pt-safe pb-8 relative overflow-hidden bg-slate-50">
      {/* Header & Progress */}
      <header className="px-4 py-4 flex items-center justify-between z-10 bg-slate-50/80 backdrop-blur-md">
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
      <div className="flex-1 px-6 flex flex-col relative mt-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -50, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="flex flex-col h-full"
          >
            <h2 className="text-pink-500 font-semibold mb-2">{currentQ.title}</h2>
            <h3 className="text-2xl font-bold text-slate-800 leading-snug text-balance">
              {currentQ.text}
            </h3>

            <div className="mt-12 flex flex-col gap-4">
              <button
                onClick={() => handleAnswer(true)}
                className={cn(
                  "w-full py-5 px-6 rounded-2xl bg-white shadow-sm text-left font-semibold text-slate-800 hover:bg-pink-50 hover:text-pink-900 active:scale-[0.98] transition-all flex items-center justify-between group relative overflow-hidden",
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
                  "w-full py-5 px-6 rounded-2xl bg-white shadow-sm text-left font-semibold text-slate-800 hover:bg-blue-50 hover:text-blue-900 active:scale-[0.98] transition-all flex items-center justify-between group relative overflow-hidden",
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
