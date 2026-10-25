"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Info, Copy, Check } from "lucide-react";

const IN_APP_BROWSERS: [string, RegExp][] = [
  ["Facebook / Messenger", /FBAN|FBAV|FB_IAB|FBIOS/i],
  ["Instagram", /Instagram/i],
  ["TikTok", /musical_ly|BytedanceWebview|TikTok/i],
  ["X (Twitter)", /Twitter/i],
  ["WeChat", /MicroMessenger/i],
  ["LinkedIn", /LinkedInApp/i],
  ["Snapchat", /Snapchat/i],
];

const isAndroid = (ua: string) => /Android/i.test(ua);
const isIOS = (ua: string) => /iPhone|iPad|iPod/i.test(ua);

// แอปอื่นๆ ที่ฝังเว็บไว้: Android WebView มี "; wv)" ส่วน WebView บน iOS ไม่มี "Safari/" (Chrome/Firefox บน iOS มี)
const isGenericWebView = (ua: string) =>
  /; wv\)/.test(ua) || (isIOS(ua) && !/Safari\//.test(ua) && !(navigator as { standalone?: boolean }).standalone);

// Tailwind v4 ใช้สี oklch และหน้าเว็บใช้ :has() — ไม่รองรับ = หน้าตาพัง (Safari < 16.4, Chrome < 111)
const isUnsupportedBrowser = () =>
  typeof CSS === "undefined" || !CSS.supports("color", "oklch(0% 0 0)") || !CSS.supports("selector(:has(*))");

export default function ExternalBrowserRedirect() {
  // app = ชื่อแอปที่เปิดอยู่, ไม่มี app = เบราว์เซอร์ไม่รองรับ
  const [blocked, setBlocked] = useState<{ app?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const currentUrl = window.location.href;

    // LINE เปิดเบราว์เซอร์ภายนอกให้เองเมื่อมี openExternalBrowser=1
    if (/\bLine\//.test(ua)) {
      if (!currentUrl.includes("openExternalBrowser=1")) {
        const separator = currentUrl.includes("?") ? "&" : "?";
        window.location.href = currentUrl + separator + "openExternalBrowser=1";
        return;
      }
      setBlocked({ app: "LINE" });
      return;
    }

    const app = IN_APP_BROWSERS.find(([, re]) => re.test(ua))?.[0];
    if (app) setBlocked({ app });
    else if (isGenericWebView(ua)) setBlocked({ app: "แอปพลิเคชันอื่น" });
    else if (isUnsupportedBrowser()) setBlocked({});
  }, []);

  if (!blocked) return null;
  const ua = navigator.userAgent;

  const openInBrowser = () => {
    const url = window.location.href;
    if (isAndroid(ua)) {
      window.location.href = `intent://${url.replace(/^https?:\/\//, "")}#Intent;scheme=https;package=com.android.chrome;end`;
    } else {
      // x-safari-https:// เปิด Safari ได้ตั้งแต่ iOS 17 — รุ่นเก่ากว่าไม่มีอะไรเกิดขึ้น จึงยังมีปุ่มคัดลอกลิงก์ไว้
      window.location.href = `x-safari-${url}`;
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      window.prompt("คัดลอกลิงก์นี้ไปเปิดในเบราว์เซอร์", window.location.href);
    }
  };

  const canOpen = isAndroid(ua) || isIOS(ua);
  const browserName = isAndroid(ua) ? "Chrome" : "Safari";

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center overflow-y-auto">
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-500 max-w-sm w-full bg-slate-800 p-8 rounded-3xl shadow-2xl border border-slate-700">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6">
          <ExternalLink className="w-8 h-8 text-blue-400" />
        </div>
        <h2 className="text-xl font-bold mb-3">กรุณาเปิดในเบราว์เซอร์หลัก</h2>
        <p className="text-slate-300 text-sm leading-relaxed mb-6">
          {blocked.app
            ? `คุณกำลังใช้งานผ่าน ${blocked.app} ซึ่งอาจทำให้บางฟังก์ชันของ MomSafe ทำงานไม่สมบูรณ์`
            : "เบราว์เซอร์นี้ไม่รองรับ MomSafe กรุณาเปิดด้วย Chrome หรือ Safari เวอร์ชันล่าสุด"}
        </p>

        <div className="w-full flex flex-col gap-3 mb-6">
          {canOpen && (
            <button
              type="button"
              onClick={openInBrowser}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-500 hover:bg-blue-400 rounded-2xl font-semibold transition-colors"
            >
              <ExternalLink className="w-5 h-5" aria-hidden="true" />
              เปิดใน {browserName}
            </button>
          )}
          <button
            type="button"
            onClick={copyLink}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-slate-700 hover:bg-slate-600 rounded-2xl font-semibold transition-colors"
          >
            {copied ? <Check className="w-5 h-5" aria-hidden="true" /> : <Copy className="w-5 h-5" aria-hidden="true" />}
            {copied ? "คัดลอกลิงก์แล้ว" : "คัดลอกลิงก์"}
          </button>
        </div>

        {blocked.app && (
          <div className="bg-slate-900 rounded-2xl p-4 w-full flex items-start gap-3 text-left">
            <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-sm text-slate-300">
              <p className="font-semibold text-slate-200 mb-1">ถ้ากดปุ่มแล้วไม่เปิด:</p>
              <ol className="list-decimal ml-4 space-y-1">
                <li>แตะที่ไอคอน <strong className="text-white">...</strong> (จุดสามจุด) มุมขวาบน</li>
                <li>เลือก <strong className="text-white">&quot;เปิดในเบราว์เซอร์&quot;</strong> หรือ <strong className="text-white">&quot;Open in Browser&quot;</strong></li>
              </ol>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
