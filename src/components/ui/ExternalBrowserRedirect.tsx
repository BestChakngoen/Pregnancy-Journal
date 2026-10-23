"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Info } from "lucide-react";

export default function ExternalBrowserRedirect() {
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  const [appName, setAppName] = useState("");

  useEffect(() => {
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    const currentUrl = window.location.href;

    // Detect LINE
    if (ua.indexOf("Line") > -1) {
      if (!currentUrl.includes("openExternalBrowser=1")) {
        const separator = currentUrl.includes("?") ? "&" : "?";
        window.location.href = currentUrl + separator + "openExternalBrowser=1";
        return; // Redirecting, stop execution
      }
      setAppName("LINE");
      setIsInAppBrowser(true);
    } 
    // Detect Facebook / Messenger
    else if (ua.indexOf("FBAV") > -1 || ua.indexOf("FBAN") > -1) {
      setAppName("Facebook / Messenger");
      setIsInAppBrowser(true);
    } 
    // Detect Instagram
    else if (ua.indexOf("Instagram") > -1) {
      setAppName("Instagram");
      setIsInAppBrowser(true);
    }
    // Detect Twitter
    else if (ua.indexOf("Twitter") > -1) {
      setAppName("Twitter");
      setIsInAppBrowser(true);
    }
  }, []);

  if (!isInAppBrowser) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center">
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500 max-w-sm w-full bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
          <ExternalLink className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-xl font-bold mb-3">กรุณาเปิดในเบราว์เซอร์หลัก</h2>
        <p className="text-slate-300 text-sm leading-relaxed mb-6">
          คุณกำลังใช้งานผ่าน {appName} ซึ่งอาจทำให้บางฟังก์ชันของ MomSafe ทำงานไม่สมบูรณ์
        </p>
        
        <div className="bg-slate-900 rounded-2xl p-4 w-full flex items-start gap-3 text-left">
          <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div className="text-sm text-slate-300">
            <p className="font-semibold text-slate-200 mb-1">วิธีแก้ไข:</p>
            <ol className="list-decimal ml-4 space-y-1">
              <li>แตะที่ไอคอน <strong className="text-white">...</strong> (จุดสามจุด) มุมขวาบน</li>
              <li>เลือก <strong className="text-white">"เปิดในเบราว์เซอร์"</strong> หรือ <strong className="text-white">"Open in Browser"</strong></li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
