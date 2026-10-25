"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Portal from "@/components/ui/Portal";
import { X, BellRing, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAlertStore } from "@/lib/alertStore";
import { NOTIFY_STORAGE_KEY, isActive, parseNotifyPrefs, type NotifyPrefs, type PermissionState } from "@/lib/notificationPrefs";
import { currentPermission, currentSupport, registerWorker, requestPermission, showTestNotification } from "@/lib/notifications";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TYPES = [
  { key: "bp", label: "เตือนวัดและบันทึกความดันทุกวัน" },
  { key: "kicks", label: "เตือนนับลูกดิ้น" },
] as const;

const UNSUPPORTED_MESSAGE = {
  ios: "ยังไม่รองรับการแจ้งเตือนบน iPhone/iPad ตอนนี้ใช้งานได้บน Android และคอมพิวเตอร์",
  unsupported: "เบราว์เซอร์นี้ไม่รองรับการแจ้งเตือน หากเปิดผ่านแอป LINE/Facebook/Instagram ให้เปิดลิงก์ใน Chrome แล้วลองใหม่",
};

const showError = (title: string) =>
  useAlertStore.getState().showAlert({ type: "error", title, message: "กรุณาลองใหม่อีกครั้ง" });

// อยู่ใต้ <Portal> จึงเรนเดอร์ฝั่งไคลเอนต์เท่านั้น: อ่าน window/localStorage ตอนเริ่มต้นได้ และอ่านใหม่ทุกครั้งที่เปิด
function NotificationPanel() {
  const [support] = useState(currentSupport);
  const [permission, setPermission] = useState<PermissionState>(() => (support === "ok" ? currentPermission() : "default"));
  const [prefs, setPrefs] = useState<NotifyPrefs>(() => parseNotifyPrefs(localStorage.getItem(NOTIFY_STORAGE_KEY)));
  const [busy, setBusy] = useState(false);
  const active = isActive(prefs, permission);

  const save = (next: NotifyPrefs) => {
    setPrefs(next);
    localStorage.setItem(NOTIFY_STORAGE_KEY, JSON.stringify(next));
  };

  const handleToggle = async () => {
    if (active) return save({ ...prefs, enabled: false });
    setBusy(true);
    try {
      // ขอสิทธิ์ทันทีจากการแตะ (มีสิทธิ์แล้วได้ "granted" กลับมาเลยไม่ถามซ้ำ, เคยบล็อกไว้ได้ "denied" ทันที)
      const result = await requestPermission();
      setPermission(result);
      if (result === "granted") {
        await registerWorker();
        save({ ...prefs, enabled: true });
      }
    } catch (err) {
      console.error("Error enabling notifications:", err);
      showError("เปิดการแจ้งเตือนไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  const handleTest = async () => {
    setBusy(true);
    try {
      await showTestNotification();
    } catch (err) {
      console.error("Error showing test notification:", err);
      showError("ส่งการแจ้งเตือนทดสอบไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  if (support !== "ok") {
    return <p className="p-4 bg-amber-50 rounded-2xl text-sm text-amber-900 leading-relaxed">{UNSUPPORTED_MESSAGE[support]}</p>;
  }

  const status = permission === "denied" ? "ถูกบล็อกในเบราว์เซอร์ — อนุญาตได้ที่การตั้งค่าเว็บไซต์ของเบราว์เซอร์ แล้วเปิดหน้านี้ใหม่" : active ? "เปิดอยู่" : "ปิดอยู่";

  return (
    <>
      <div className="flex items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl">
        <div className="min-w-0">
          <p id="notify-switch-label" className="font-semibold text-slate-800 text-sm">เปิดการแจ้งเตือนบนเครื่องนี้</p>
          <p aria-live="polite" className={cn("text-xs mt-0.5", permission === "denied" ? "text-red-700" : "text-slate-600")}>{status}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={active}
          aria-labelledby="notify-switch-label"
          disabled={busy}
          onClick={handleToggle}
          className="shrink-0 min-h-[44px] min-w-[60px] flex items-center justify-center rounded-full disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
        >
          <span className={cn("relative block w-14 h-8 rounded-full transition-colors", active ? "bg-emerald-600" : "bg-slate-300")}>
            <span className={cn("absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform", active && "translate-x-6")} />
          </span>
        </button>
      </div>

      <div role="group" aria-labelledby="notify-types-label" className="flex flex-col gap-2">
        <p id="notify-types-label" className="text-sm font-semibold text-slate-700 ml-1">ให้เตือนเรื่อง</p>
        {TYPES.map((t) => (
          <label key={t.key} className={cn("flex items-center gap-3 p-4 min-h-[56px] bg-slate-50 rounded-2xl text-sm text-slate-800", !active && "opacity-60")}>
            <input
              type="checkbox"
              checked={prefs[t.key]}
              disabled={!active}
              onChange={(e) => save({ ...prefs, [t.key]: e.target.checked })}
              className="w-5 h-5 accent-pink-600"
            />
            {t.label}
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={handleTest}
        disabled={!active || busy}
        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-semibold text-white bg-slate-800 shadow-lg shadow-slate-800/20 active:scale-95 transition-all disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none disabled:active:scale-100"
      >
        <Send className="w-5 h-5" aria-hidden="true" />
        ทดสอบแจ้งเตือน
      </button>

      <p className="text-xs text-slate-600 leading-relaxed">
        ตอนนี้ระบบยังไม่ส่งการเตือนอัตโนมัติ — บันทึกความต้องการของคุณไว้ในเครื่องนี้ และจะเริ่มเตือนเมื่อเปิดใช้บริการเตือนในเวอร์ชันถัดไป
      </p>
    </>
  );
}

export default function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  return (
    <Portal>
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            data-scroll-lock
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="notify-title"
            className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto md:bottom-1/2 md:translate-y-1/2 md:rounded-[2rem] bg-white/95 backdrop-blur-xl rounded-t-[2rem] shadow-2xl z-50 flex flex-col max-h-[90vh]"
          >
            <div className="w-full flex justify-center pt-3 pb-2" onClick={onClose}>
              <div className="w-12 h-1.5 bg-slate-300/50 rounded-full" />
            </div>

            <div className="px-6 pb-2 pt-2 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-100/80 text-amber-600 rounded-xl">
                  <BellRing className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 id="notify-title" className="text-xl font-bold text-slate-800">การแจ้งเตือน</h2>
                  <p className="text-sm text-slate-500">เปิดแจ้งเตือนบนมือถือเครื่องนี้</p>
                </div>
              </div>
              <button onClick={onClose} className="w-11 h-11 flex items-center justify-center bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200 transition-colors" aria-label="ปิด">
                <X className="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <div className="px-6 pt-4 pb-6 pb-safe overflow-y-auto overscroll-contain flex flex-col gap-5">
              <NotificationPanel />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </Portal>
  );
}
