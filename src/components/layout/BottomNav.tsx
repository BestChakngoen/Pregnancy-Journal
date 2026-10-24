"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, Activity, BookOpen, User } from "lucide-react";
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
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 md:top-0 md:bottom-auto w-full max-w-md md:max-w-[256px] md:h-dvh z-40 bg-white/95 backdrop-blur-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:shadow-[4px_0_24px_rgba(0,0,0,0.05)] border-t md:border-t-0 md:border-r border-slate-100/80 pb-safe md:pb-0 transition-all duration-300">
      <nav className="flex md:flex-col md:overflow-y-auto justify-between md:justify-start items-center md:items-stretch px-6 py-2 max-md:landscape:py-0.5 md:p-6 pointer-events-auto md:h-full md:gap-2">
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
                "relative flex flex-col md:flex-row items-center md:justify-start justify-center min-w-[64px] h-[56px] max-md:landscape:h-10 max-md:landscape:flex-row max-md:landscape:gap-2 md:h-[52px] md:px-5 transition-all duration-300 rounded-2xl group",
                isActive ? "text-pink-600 md:bg-pink-50" : "text-slate-400 hover:text-slate-600 md:hover:bg-slate-50"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 bg-pink-50/80 md:hidden rounded-2xl -z-10 scale-105" />
              )}
              <Icon className={cn(
                "w-6 h-6 mb-1 max-md:landscape:mb-0 md:mb-0 md:mr-4 transition-transform duration-300",
                isActive ? "scale-110" : "group-active:scale-95"
              )} strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn(
                "text-[10px] md:text-sm transition-all duration-300",
                isActive ? "font-bold opacity-100" : "font-medium opacity-80"
              )}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
