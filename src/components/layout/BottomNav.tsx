"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Activity, BookOpen, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "หน้าหลัก", icon: Home },
    { href: "/tracking", label: "ติดตาม", icon: Activity },
    { href: "/education", label: "ความรู้", icon: BookOpen },
    { href: "/profile", label: "โปรไฟล์", icon: User },
  ];

  const hiddenPaths = ["/onboarding", "/assessment", "/pre-test", "/post-test", "/satisfaction", "/admin", "/education/ebook"];
  const isHidden = hiddenPaths.some(p => pathname?.startsWith(p));
  if (isHidden) return null;

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-40 bg-white/95 backdrop-blur-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] border-t border-slate-100/80 pb-safe">
      <nav className="flex justify-between items-center px-6 py-2 pointer-events-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center min-w-[64px] h-[56px] transition-all duration-300 rounded-2xl group",
                isActive ? "text-pink-600" : "text-slate-400 hover:text-slate-600"
              )}
            >
              {isActive && (
                <div className="absolute inset-0 bg-pink-50/80 rounded-2xl -z-10 scale-105" />
              )}
              <Icon className={cn(
                "w-6 h-6 mb-1 transition-transform duration-300",
                isActive ? "scale-110" : "group-active:scale-95"
              )} strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn(
                "text-[10px] transition-all duration-300",
                isActive ? "font-bold opacity-100" : "font-medium opacity-80"
              )}>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
