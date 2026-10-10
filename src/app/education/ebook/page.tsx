"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EbookPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-dvh bg-slate-900">
      {/* Header */}
      <header className="flex items-center p-4 bg-white/90 backdrop-blur-md shadow-sm shrink-0 relative z-10">
        <button 
          onClick={() => router.back()} 
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
    </div>
  );
}
