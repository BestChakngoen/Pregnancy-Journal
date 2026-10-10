"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import FloatingParticles from "@/components/ui/FloatingParticles";

const QUESTIONS = [
  { id: 1, text: "ภาวะความดันโลหิตสูง คือ ภาวะที่แรงดันเลือดในหลอดเลือดแดงสูงกว่าปกติ อย่างต่อเนื่อง โดยมีค่าความดันตั้งแต่ 140/90 มิลลิเมตรปรอท ขึ้นไป หากปล่อยไว้ โดยไม่รักษาจะทำให้หลอดเลือดเสียหายและเสี่ยงเกิดโรคแทรกซ้อนรุนแรง", answer: true },
  { id: 2, text: "อาการปวดศีรษะรุนแรง ตาพร่ามัว หรือเห็นแสงวาบ เป็นอาการเตือนที่ควรรีบ พบแพทย์", answer: true },
  { id: 3, text: "หากวัดความดันโลหิตได้ตั้งแต่ 160/110 mmHg ขึ้นไป ถือเป็นภาวะที่ควรได้รับ การประเมินทางการแพทย์อย่างเร่งด่วน", answer: true },
  { id: 4, text: "การนอนตะแคงซ้ายขณะพักผ่อนช่วยลดการกดทับหลอดเลือดดำใหญ่และเพิ่ม การไหลเวียนเลือดไปเลี้ยงรกได้ดีขึ้น", answer: true },
  { id: 5, text: "การลดอาหารรสเค็ม หลีกเลี่ยงเครื่องดื่มแอลกอฮอล์และบุหรี่ และควบคุม น้ำหนักอย่างเหมาะสม เป็นส่วนหนึ่งของการดูแลตนเอง", answer: true },
  { id: 6, text: "หญิงตั้งครรภ์ที่มีความเสี่ยงควรหลีกเลี่ยงการออกกำลังกายหรือการเคลื่อนไหว ร่างกายทุกชนิด", answer: false },
  { id: 7, text: "หากรู้สึกว่าลูกดิ้นลดลงอย่างผิดปกติ หญิงตั้งครรภ์ควรรอดูอาการก่อนและไม่ จำเป็นต้องแจ้งบุคลากรทางการแพทย์", answer: false },
  { id: 8, text: "หญิงตั้งครรภ์สามารถซื้อยามารับประทานเองได้ หากคิดว่าตนเองมีความเสี่ยงต่อ ภาวะความดันโลหิตสูง", answer: false },
  { id: 9, text: "หญิงตั้งครรภ์ควรเลือกรับประทานอาหารที่มีโปรตีน เช่น เนื้อสัตว์ไม่ติดมัน นม ไข่ ถั่วเหลือง ฯลฯ", answer: true },
  { id: 10, text: "หากหญิงตั้งครรภ์รับประทานอาหารไม่ครบ 5 หมู่ อาจส่งผลกระทบต่อสุขภาพ ของทั้งมารดาและทารกในครรภ์ได้", answer: true },
];

interface QuizProps {
  type: "pre-test" | "post-test";
  title: string;
}

export default function Quiz({ type, title }: QuizProps) {
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
  const progressPercent = (currentStep / totalSteps) * 100;

  const handleAnswer = (val: boolean) => {
    setAnswers((prev) => ({ ...prev, [QUESTIONS[currentStep].id]: val }));
    setIsAdvancing(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    
    // Auto proceed
    timerRef.current = setTimeout(() => {
      setIsAdvancing(false);
      if (currentStep < totalSteps - 1) {
        setCurrentStep(prev => prev + 1);
      } else {
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

  const calculateScore = () => {
    let score = 0;
    QUESTIONS.forEach((q) => {
      if (answers[q.id] === q.answer) {
        score += 1;
      }
    });
    return score;
  };

  if (isFinished) {
    const score = calculateScore();
    return (
      <div className="min-h-dvh flex flex-col bg-slate-50 pt-12 pb-8 px-6">
        <FloatingParticles count={20} />
        <h1 className="text-2xl font-bold text-slate-800 text-center mb-8 relative z-10">สรุปผลคะแนน {title}</h1>
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-3xl p-8 flex flex-col items-center text-center shadow-sm bg-blue-50 relative z-10"
        >
          <CheckCircle2 className="w-12 h-12 text-blue-500" />
          <h2 className="text-4xl font-bold mt-4 mb-1 text-blue-600">{score} / {totalSteps}</h2>
          <p className="text-slate-600/90 font-medium mt-2">ทำแบบทดสอบเสร็จสมบูรณ์</p>
        </motion.div>

        <div className="mt-auto pt-8">
          <button
            onClick={() => router.push("/education")}
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
          className="h-full bg-blue-400 rounded-r-full"
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
            <h2 className="text-blue-500 font-semibold mb-2">{title}</h2>
            <h3 className="text-xl font-bold text-slate-800 leading-snug text-balance">
              {currentQ.text}
            </h3>

            <div className="mt-12 flex flex-col gap-4">
              <button
                onClick={() => handleAnswer(true)}
                className={cn(
                  "w-full py-5 px-6 rounded-2xl bg-white shadow-sm text-left font-semibold text-slate-800 hover:bg-emerald-50 hover:text-emerald-900 active:scale-[0.98] transition-all flex items-center justify-between group relative overflow-hidden",
                  answers[currentQ.id] === true && "bg-emerald-50 text-emerald-900"
                )}
              >
                <span className="relative z-10 flex items-center justify-between w-full">
                  ใช่
                  <ArrowRight className={cn("w-5 h-5 text-slate-300 group-hover:text-emerald-400", answers[currentQ.id] === true && "text-emerald-500")} />
                </span>
                {answers[currentQ.id] === true && isAdvancing && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.3, ease: "linear" }}
                    className="absolute bottom-0 left-0 h-1.5 bg-emerald-400/50"
                  />
                )}
              </button>
              <button
                onClick={() => handleAnswer(false)}
                className={cn(
                  "w-full py-5 px-6 rounded-2xl bg-white shadow-sm text-left font-semibold text-slate-800 hover:bg-rose-50 hover:text-rose-900 active:scale-[0.98] transition-all flex items-center justify-between group relative overflow-hidden",
                  answers[currentQ.id] === false && "bg-rose-50 text-rose-900"
                )}
              >
                <span className="relative z-10 flex items-center justify-between w-full">
                  ไม่ใช่
                  <ArrowRight className={cn("w-5 h-5 text-slate-300 group-hover:text-rose-400", answers[currentQ.id] === false && "text-rose-500")} />
                </span>
                {answers[currentQ.id] === false && isAdvancing && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 0.3, ease: "linear" }}
                    className="absolute bottom-0 left-0 h-1.5 bg-rose-400/50"
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