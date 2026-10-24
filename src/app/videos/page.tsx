"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronLeft, PlayCircle } from "lucide-react";

export default function VideosPage() {
  const router = useRouter();

  return (
    <div className="min-h-svh flex flex-col bg-slate-50 pt-safe pb-8 relative overflow-hidden pb-20 md:pb-0 phone-landscape:pb-0 phone-landscape:pt-12">
      {/* Header */}
      <header className="px-4 py-4 flex items-center justify-between z-10 bg-slate-50/80 backdrop-blur-md sticky top-0">
        <button onClick={() => router.back()} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold text-slate-800 tracking-wide">วิดีโอให้ความรู้</h1>
        <div className="w-10" />
      </header>

      <main className="px-6 mt-6 flex flex-col gap-6 flex-1">
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-3"
        >
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight leading-snug">
            ภาวะความดันโลหิตสูงขณะตั้งครรภ์
          </h2>
          <p className="text-slate-600 text-sm">
            เรียนรู้เกี่ยวกับสาเหตุ อาการ และการดูแลตัวเองเพื่อป้องกันภาวะแทรกซ้อนที่อาจเกิดขึ้นระหว่างการตั้งครรภ์
          </p>
        </motion.div>

        {/* Video Player */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="w-full rounded-3xl overflow-hidden shadow-lg border-4 bg-black relative"
        >
          <video 
            className="w-full aspect-video object-cover"
            controls
            preload="metadata"
            poster="/images/lemon.jpg" // fallback poster
          >
            <source src="/videos/Video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-5 bg-white rounded-2xl shadow-sm mt-2"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 rounded-xl">
              <PlayCircle className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-slate-800">สรุปเนื้อหาสำคัญ</h3>
          </div>
          <ul className="flex flex-col gap-2 text-sm text-slate-600">
            <li className="flex gap-2"><span className="text-purple-400">•</span> อาการที่ควรเฝ้าระวัง เช่น ปวดศีรษะรุนแรง ตาพร่ามัว</li>
            <li className="flex gap-2"><span className="text-purple-400">•</span> การดูแลโภชนาการ และการพักผ่อน</li>
            <li className="flex gap-2"><span className="text-purple-400">•</span> การมาพบแพทย์ตามนัดอย่างสม่ำเสมอ</li>
          </ul>
        </motion.div>

      </main>
    </div>
  );
}