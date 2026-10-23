"use client";

import { Smartphone } from "lucide-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function PortraitLockOverlay() {
  const [isLandscapeMobile, setIsLandscapeMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    // If we are on a page that allows landscape (e.g. Ebook), do not show overlay
    if (pathname === "/education/ebook") {
      setIsLandscapeMobile(false);
      return;
    }

    const checkOrientation = () => {
      // Check if the device has touch capabilities (likely mobile/tablet)
      const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
      
      // Check if orientation is landscape
      const isLandscape = window.matchMedia("(orientation: landscape)").matches;
      
      // Usually smartphones in landscape have small heights
      const isShortHeight = window.innerHeight < 600;

      // Only show on touch devices when in landscape and short height
      if (isTouch && isLandscape && isShortHeight) {
        setIsLandscapeMobile(true);
      } else {
        setIsLandscapeMobile(false);
      }
    };

    window.addEventListener("resize", checkOrientation);
    // Initial check
    checkOrientation();

    return () => window.removeEventListener("resize", checkOrientation);
  }, [pathname]);

  if (!isLandscapeMobile) return null;

  return (
    <div className="fixed inset-0 z-[10000] bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500">
        <div className="relative w-24 h-24 mb-6 animate-pulse">
          <Smartphone className="w-full h-full text-blue-400 rotate-90" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold mb-3">กรุณาหมุนโทรศัพท์ของคุณ</h2>
        <p className="text-slate-300 max-w-xs text-sm">
          MomSafe ออกแบบมาเพื่อการใช้งานในแนวตั้ง (Portrait Mode) เพื่อประสบการณ์ที่ดีที่สุดครับ
        </p>
      </div>
    </div>
  );
}
