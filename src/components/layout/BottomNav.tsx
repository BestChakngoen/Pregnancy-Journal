"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Activity, BookOpen, User, Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

// id ต้องตรงกับ section ใน src/app/page.tsx
const navItems = [
  { id: "home", label: "หน้าหลัก", icon: Home },
  { id: "tracking", label: "ติดตาม", icon: Activity },
  { id: "education", label: "ความรู้", icon: BookOpen },
  { id: "profile", label: "โปรไฟล์", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const [active, setActive] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false); // ลิ้นชักเมนูในมือถือแนวนอน

  // เมนูที่ active = section ที่คาบเส้นกึ่งกลางจอ
  useEffect(() => {
    if (pathname !== "/") return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: "-50% 0px -50% 0px" }
    );
    navItems.forEach((i) => {
      const el = document.getElementById(i.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [pathname]);

  const hiddenPaths = ["/login", "/onboarding", "/assessment", "/pre-test", "/post-test", "/satisfaction", "/admin", "/education/ebook"];
  const isHidden = hiddenPaths.some(p => pathname?.startsWith(p));
  if (isHidden) return null;

  return (
    <>
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 md:top-0 md:bottom-auto w-full max-w-md md:max-w-[256px] md:h-dvh z-40 bg-white/95 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:shadow-[4px_0_24px_rgba(0,0,0,0.05)] border-t md:border-t-0 md:border-r border-slate-100/80 pb-safe md:pb-0 phone-landscape:hidden">
      <nav className="flex md:flex-col md:overflow-y-auto justify-between md:justify-start items-center md:items-stretch px-6 py-2 md:p-6 pointer-events-auto md:h-full md:gap-2">
        {/* Desktop Logo Area */}
        <div className="hidden md:flex flex-col items-center justify-center py-6 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-200 mb-3">
            <span className="text-white font-bold text-xl">M</span>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-600 to-rose-400 tracking-tight">MomSafe</span>
        </div>

        {navItems.map((item) => {
          const isActive = pathname === "/" && active === item.id;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.id}
              href={`/#${item.id}`}
              className={cn(
                "relative flex flex-col md:flex-row items-center md:justify-start justify-center min-w-[64px] h-[56px] md:h-[52px] md:px-5 transition-colors duration-300 rounded-2xl group",
                isActive ? "text-pink-600 md:bg-pink-50" : "text-slate-400 hover:text-slate-600 md:hover:bg-slate-50"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 bg-pink-50/80 md:hidden rounded-2xl -z-10 scale-105" />
              )}
              <Icon className={cn(
                "w-6 h-6 mb-1 md:mb-0 md:mr-4 transition-transform duration-300",
                isActive ? "scale-110" : "group-active:scale-95"
              )} strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn(
                "text-[10px] md:text-sm font-semibold transition-opacity duration-300",
                isActive ? "opacity-100" : "opacity-80"
              )}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      </div>

      {/* มือถือแนวนอน: ซ่อนแถบเมนู เหลือปุ่ม 3 ขีดมุมบนซ้าย */}
      <button
        onClick={() => setMenuOpen(true)}
        aria-label="เปิดเมนู"
        className="hidden phone-landscape:flex fixed top-2 left-2 z-40 w-11 h-11 items-center justify-center rounded-full bg-white/90 backdrop-blur-md shadow-md text-slate-600 active:scale-95 transition-transform"
      >
        <Menu className="w-5 h-5" aria-hidden="true" />
      </button>
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="hidden phone-landscape:block fixed inset-0 z-50 bg-slate-900/30"
            />
            <motion.nav
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="hidden phone-landscape:flex fixed top-0 left-0 z-50 h-dvh w-60 overflow-y-auto bg-white/95 backdrop-blur-xl shadow-xl p-3 flex-col gap-1"
            >
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="ปิดเมนู"
                className="w-11 h-11 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
              {navItems.map((item) => {
                const isActive = pathname === "/" && active === item.id;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={`/#${item.id}`}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-4 h-12 px-4 rounded-2xl text-sm font-semibold transition-colors",
                      isActive ? "bg-pink-50 text-pink-600" : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                    <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                    {item.label}
                  </Link>
                );
              })}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
