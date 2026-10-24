"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, CheckCircle2, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import FloatingParticles from "@/components/ui/FloatingParticles";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useUserStore } from "@/lib/userStore";

const QUESTIONS = [
  { id: 1, text: "แอปพลิเคชันมีขั้นตอนการใช้งานที่เข้าใจง่าย" },
  { id: 2, text: "สามารถใช้งานแอปพลิเคชันได้สะดวกและไม่ซับซ้อน" },
  { id: 3, text: "รูปแบบและการจัดวางเมนูต่าง ๆ มีความเหมาะสม" },
  { id: 4, text: "เนื้อหาเกี่ยวกับอาการ สาเหตุ การปฏิบัติตัว ผลกระทบทั้งมารดาและทารกของภาวะความดันโลหิตสูงขณะตั้งครรภ์เข้าใจง่าย" },
  { id: 5, text: "การมีทั้งคลิปวิดีโอและ E-book ช่วยให้สามารถเรียนรู้เนื้อหาได้ตามความสะดวก" },
  { id: 6, text: "แอปพลิเคชันช่วยให้ท่านมีความรู้และความเข้าใจเกี่ยวกับภาวะความดันโลหิตสูงขณะตั้งครรภ์มากขึ้น" },
  { id: 7, text: "แอปพลิเคชันช่วยให้ท่านตระหนักถึงการดูแลสุขภาพและป้องกันภาวะความดันโลหิตสูงขณะตั้งครรภ์มากขึ้น" },
  { id: 8, text: "โดยภาพรวม ท่านมีความพึงพอใจต่อการใช้แอปพลิเคชันนี้" },
];

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
            const userRef = doc(db, "users", user.name.toLowerCase());
            await setDoc(userRef, { satisfaction: newAnswers }, { merge: true });
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
      <div className="min-h-dvh flex flex-col bg-slate-50 pt-12 pb-8 px-6">
        <FloatingParticles count={20} />
        <h1 className="text-2xl font-bold text-slate-800 text-center mb-8">ขอบคุณสำหรับคำประเมิน</h1>
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-3xl p-8 flex flex-col items-center text-center shadow-sm bg-amber-50"
        >
          <CheckCircle2 className="w-12 h-12 text-amber-500" />
          <h2 className="text-2xl font-bold mt-4 mb-1 text-amber-600">บันทึกข้อมูลสำเร็จ</h2>
          <p className="text-slate-600/90 font-medium mt-2">ความคิดเห็นของท่านจะเป็นประโยชน์ในการพัฒนาแอปพลิเคชันต่อไป</p>
        </motion.div>

        <div className="mt-auto pt-8">
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
    <div className="min-h-dvh flex flex-col pt-safe pb-8 relative overflow-hidden bg-slate-50">
      <header className="px-4 py-4 flex items-center justify-between z-10 bg-slate-50/80 backdrop-blur-md">
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
            <h2 className="text-amber-500 font-semibold mb-2">แบบประเมินความพึงพอใจ</h2>
            <h3 className="text-xl font-bold text-slate-800 leading-snug text-balance">
              {currentQ.text}
            </h3>

            <div className="mt-12 flex flex-col gap-3">
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
                    "w-full py-4 px-6 rounded-2xl bg-white shadow-sm text-left font-semibold text-slate-800 hover:bg-amber-50 hover:text-amber-900 active:scale-[0.98] transition-all flex items-center justify-between relative overflow-hidden",
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