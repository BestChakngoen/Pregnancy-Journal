"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpen, PlayCircle, FileText, CheckCircle2, ChevronRight } from "lucide-react";
import AnimatedCard from "@/components/ui/AnimatedCard";

export default function EducationSection() {
  const router = useRouter();
  
  return (
    <div className="pb-24">
      {/* Header */}
      <header className="p-6 pb-4 md:pt-10 md:px-10">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">ศูนย์ความรู้คุณแม่</h1>
        <p className="text-slate-500 mt-1">เตรียมความพร้อมเพื่อลูกน้อยที่แข็งแรง</p>
      </header>

      <main className="px-6 flex flex-col md:grid md:grid-cols-3 md:gap-8 gap-6 md:px-10">
        
        {/* Step 1: Pre-test */}
        <section>
          <div className="flex items-center gap-2 mb-3 ml-1">
            <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-bold">1</span>
            <h3 className="font-semibold text-slate-800/90">ทดสอบก่อนเรียน</h3>
          </div>
          <button 
            onClick={() => router.push("/pre-test")}
            className="w-full flex items-center justify-between p-4 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm hover:bg-white/80 transition-all active:scale-[0.98]"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100/80 rounded-2xl">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-left">
                <h4 className="font-semibold text-slate-800/90 text-sm">แบบทดสอบ Pre-test</h4>
                <p className="text-xs text-slate-600/80 mt-0.5">วัดความรู้ก่อนเริ่มเรียน</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>
        </section>

        {/* Step 2: Main Content (E-Book & Videos) */}
        <section>
          <div className="flex items-center gap-2 mb-3 ml-1">
            <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-bold">2</span>
            <h3 className="font-semibold text-slate-800/90">เรียนรู้ด้วยตัวเอง</h3>
          </div>
          
          <div className="flex flex-col gap-4 flex-1">
            {/* E-Book Hero Card */}
            <motion.button 
              onClick={async () => {
                try {
                  if (document.documentElement.requestFullscreen) {
                    await document.documentElement.requestFullscreen();
                  }
                  if (screen.orientation && 'lock' in screen.orientation) {
                    // @ts-ignore
                    await screen.orientation.lock('landscape');
                  }
                } catch (e) {}
                
                // หน่วงเวลาเล็กน้อยเพื่อให้ Animation ขยายเต็มจอทำงานเสร็จก่อนเปลี่ยนหน้า
                setTimeout(() => {
                  router.push("/education/ebook");
                }, 300);
              }}
              className="relative overflow-hidden flex flex-col flex-1 p-6 bg-gradient-to-br from-pink-100/80 to-blue-50/80 backdrop-blur-md rounded-3xl shadow-sm hover:shadow-md transition-all active:scale-[0.98] group text-left w-full"
              whileHover={{ y: -2 }}
            >
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-pink-200/50 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
              
              <div className="p-3 bg-white/60 rounded-2xl w-fit mb-4 shadow-sm">
                <BookOpen className="w-8 h-8 text-pink-600" />
              </div>
              <h4 className="font-bold text-slate-800 text-lg mb-1 relative z-10">คู่มือคุณแม่ตั้งครรภ์ (E-Book)</h4>
              <p className="text-sm text-slate-600/90 relative z-10 mb-4">
                อ่านฟรี! คู่มือการดูแลตัวเองตลอด 9 เดือนแบบเปิดหน้ากระดาษ (Flipbook)
              </p>
              <div className="flex items-center gap-2 text-pink-600 font-semibold text-sm relative z-10">
                อ่านเลย <ChevronRight className="w-4 h-4" />
              </div>
            </motion.button>

            {/* Video Series */}
            <button 
              onClick={() => router.push("/videos")}
              className="w-full flex items-center justify-between p-4 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm hover:bg-white/80 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100/80 rounded-2xl">
                  <PlayCircle className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-left">
                  <h4 className="font-semibold text-slate-800/90 text-sm">ซีรีส์วิดีโอให้ความรู้</h4>
                  <p className="text-xs text-slate-600/80 mt-0.5">คลิปสั้นเข้าใจง่าย 5 ตอน</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          </div>
        </section>

        {/* Step 3: Post-test & Evaluation */}
        <section>
          <div className="flex items-center gap-2 mb-3 ml-1">
            <span className="w-6 h-6 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center text-xs font-bold">3</span>
            <h3 className="font-semibold text-slate-800/90">ประเมินผล</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-1 gap-4 flex-1">
            <AnimatedCard
              title="Post-test"
              subtitle="วัดความรู้หลังเรียน"
              icon={CheckCircle2}
              colorClass="bg-emerald-100/80"
              iconColorClass="text-emerald-600"
              delay={0.1}
              onClick={() => router.push("/post-test")}
            />
            <AnimatedCard
              title="ประเมินความพอใจ"
              subtitle="ให้คะแนนระบบ"
              icon={FileText}
              colorClass="bg-amber-100/80"
              iconColorClass="text-amber-600"
              delay={0.2}
              onClick={() => router.push("/satisfaction")}
            />
          </div>
        </section>

      </main>
    </div>
  );
}
