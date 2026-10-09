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

  if (pathname === "/onboarding" || pathname?.startsWith("/assessment")) return null;

  return (
    <nav className="fixed bottom-0 w-full max-w-md bg-white/80 backdrop-blur-xl border-t border-white/60 pb-safe pt-2 px-6 flex justify-between z-40">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        
        return (
          <Link 
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center p-2 min-w-[44px] min-h-[44px] transition-colors",
              isActive ? "text-pink-500" : "text-slate-400 hover:text-slate-600"
            )}
          >
            <Icon className="w-6 h-6 mb-1" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
