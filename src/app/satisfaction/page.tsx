"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, CheckCircle2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import FloatingParticles from "@/components/ui/FloatingParticles";
import { saveToMyProfile } from "@/lib/firebase";
import { SATISFACTION_QUESTIONS as QUESTIONS } from "@/lib/questions";
import { useUserStore } from "@/lib/userStore";


export default function SatisfactionSurvey() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [isAdvancing, setIsAdvancing] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const totalSteps = QUESTIONS.length;
  const progressPercent = (currentStep / totalSteps) * 100;

  const { user } = useUserStore();

  const handleAnswer = async (val: number) => {
    const newAnswers = { ...answers, [QUESTIONS[currentStep].id]: val };
    setAnswers(newAnswers);
    setIsAdvancing(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    
    // Auto proceed
    timerRef.current = setTimeout(async () => {
      setIsAdvancing(false);
      if (currentStep < totalSteps - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
        // Last step: Save to Firebase
        if (user?.name) {
          try {
            await saveToMyProfile({ satisfaction: newAnswers });
          } catch (err) {
            console.error("Error saving satisfaction survey:", err);
          }
        }
        setIsFinished(true);
      }
    }, 300);
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

  if (isFinished) {
    return (
      <div className="h-dvh overflow-hidden flex flex-col bg-slate-50 pt-12 short:pt-6 pb-8 short:pb-4 px-6 md:max-w-2xl md:mx-auto md:w-full md:shadow-sm">
        <FloatingParticles count={20} />
        <h1 className="text-2xl font-bold text-slate-800 text-center mb-8 short:mb-4">ขอบคุณสำหรับคำประเมิน</h1>
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-3xl p-8 short:p-5 flex flex-col items-center text-center shadow-sm bg-amber-50"
        >
          <CheckCircle2 className="w-12 h-12 text-amber-500" />
          <h2 className="text-2xl font-bold mt-4 mb-1 text-amber-600">บันทึกข้อมูลสำเร็จ</h2>
          <p className="text-slate-600/90 font-medium mt-2">ความคิดเห็นของท่านจะเป็นประโยชน์ในการพัฒนาแอปพลิเคชันต่อไป</p>
        </motion.div>

        <div className="mt-auto pt-8 short:pt-4">
          <button
            onClick={() => router.push("/#education")}
            className="w-full flex items-center justify-center gap-2 py-4 bg-slate-800 text-white rounded-2xl font-semibold shadow-xl shadow-slate-800/20 active:scale-95 transition-all"
          >
            กลับสู่ศูนย์ความรู้
          </button>
        </div>
      </div>
    );
  }

  const currentQ = QUESTIONS[currentStep];

  return (
    <div className="h-dvh flex flex-col pt-safe pb-6 short:pb-3 relative overflow-hidden bg-slate-50 md:max-w-2xl md:mx-auto md:w-full md:shadow-sm">
      <header className="px-4 py-4 short:py-1 flex items-center justify-between z-10 bg-slate-50/80 backdrop-blur-md">
        <button onClick={handleBack} className="w-11 h-11 flex items-center justify-center text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors" aria-label="ย้อนกลับ">
          <ChevronLeft className="w-6 h-6" aria-hidden="true" />
        </button>
        <div className="text-sm font-semibold text-slate-500 tabular-nums tracking-wide">
          ข้อ {currentStep + 1} / {totalSteps}
        </div>
        <div className="w-10" />
      </header>

      <div className="w-full h-1 bg-slate-100">
        <motion.div 
          className="h-full bg-amber-400 rounded-r-full"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

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
            <h2 className="text-amber-500 font-semibold mb-2">แบบประเมินความพึงพอใจ</h2>
            <h3 className="text-xl short:text-lg phone-landscape:text-base font-bold text-slate-800 leading-snug text-balance">
              {currentQ.text}
            </h3>

            <div className="mt-12 short:mt-4 flex flex-col gap-3 short:gap-2 phone-landscape:grid phone-landscape:grid-cols-2">
              {[
                { score: 5, label: "พึงพอใจมากที่สุด" },
                { score: 4, label: "พึงพอใจมาก" },
                { score: 3, label: "พึงพอใจปานกลาง" },
                { score: 2, label: "พึงพอใจน้อย" },
                { score: 1, label: "พึงพอใจน้อยที่สุด" },
              ].map((option) => (
                <button
                  key={option.score}
                  onClick={() => handleAnswer(option.score)}
                  className={cn(
                    "w-full py-4 short:py-2.5 px-6 rounded-2xl bg-white shadow-sm text-left font-semibold text-slate-800 hover:bg-amber-50 hover:text-amber-900 active:scale-[0.98] transition-all flex items-center justify-between relative overflow-hidden",
                    answers[currentQ.id] === option.score && "bg-amber-50 text-amber-900"
                  )}
                >
                  <span className="relative z-10 flex items-center justify-between w-full">
                    {option.label}
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-4 h-4",
                            i < option.score ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"
                          )}
                        />
                      ))}
                    </div>
                  </span>
                  {answers[currentQ.id] === option.score && isAdvancing && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.3, ease: "linear" }}
                      className="absolute bottom-0 left-0 h-1.5 bg-amber-400/50"
                    />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}