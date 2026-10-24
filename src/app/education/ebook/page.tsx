"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EbookPage() {
  const router = useRouter();

  useEffect(() => {
    // พยายามบังคับหน้าจอให้เป็นแนวนอนเมื่อเข้ามาหน้านี้ (มือถือ)
    const lockLandscape = async () => {
      try {
        if (screen.orientation && 'lock' in screen.orientation) {
          // @ts-ignore
          await screen.orientation.lock('landscape');
        }
      } catch (error) {
        console.warn("Browser does not support auto-locking orientation without user interaction or full screen.", error);
      }
    };
    
    lockLandscape();

    return () => {
      // คืนค่าหน้าจอกลับเป็นปกติเมื่อออกจากหน้านี้
      try {
        if (screen.orientation && 'unlock' in screen.orientation) {
          screen.orientation.unlock();
        }
      } catch (error) {}
    };
  }, []);

  const handleBack = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      if (screen.orientation && 'unlock' in screen.orientation) {
        screen.orientation.unlock();
      }
    } catch (e) {}
    
    // หน่วงเวลาเล็กน้อยเพื่อให้ Animation หมุนจอทำงานเสร็จก่อนเปลี่ยนหน้า
    setTimeout(() => {
      router.push("/education");
    }, 300);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col min-h-dvh bg-slate-900"
    >
      {/* Header */}
      <header className="flex items-center p-4 bg-white/90 backdrop-blur-md shadow-sm shrink-0 relative z-10">
        <button 
          onClick={handleBack} 
          className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft className="w-6 h-6 text-slate-700" />
        </button>
        <h1 className="font-semibold text-slate-800 ml-2">คู่มือคุณแม่ตั้งครรภ์ (E-Book)</h1>
      </header>
      
      {/* Iframe Container */}
      <main className="flex-1 w-full relative">
        <iframe 
          src="https://heyzine.com/flip-book/7256b18e3e.html" 
          className="absolute inset-0 w-full h-full border-none"
          title="คู่มือคุณแม่ตั้งครรภ์ E-Book"
          allowFullScreen
        ></iframe>
      </main>
    </motion.div>
  );
}
