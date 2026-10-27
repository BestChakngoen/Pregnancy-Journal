"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore/lite";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Loader2, ShieldCheck } from "lucide-react";
import { db } from "@/lib/firebase";
import { MAX_NAME_BYTES, adminNameToEmail, auth, authErrorMessage, signOutUser } from "@/lib/auth";
import { redeemAdminInvite } from "@/lib/userAdmin";
import { useAlertStore } from "@/lib/alertStore";
import { cn } from "@/lib/utils";

const INVITE_PATTERN = /^[0-9a-f]{32}$/;
const inputClasses = "mt-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-800 focus:outline-none";

// ล็อกอิน/สมัครผู้ดูแลด้วยรหัสเชิญ — บัญชีนี้แยกจากบัญชีผู้ใช้ (คนละโดเมนอีเมล) สิทธิ์จริงตรวจโดย firestore.rules
export default function AdminAuthForm({ onAuthenticated }: { onAuthenticated: (uid: string) => void }) {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [key, setKey] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isRegister = mode === "register";
  const showError = (message: string) => useAlertStore.getState().showAlert({ type: "error", title: "เกิดข้อผิดพลาด", message });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    const inviteKey = key.trim().toLowerCase();

    if (isRegister) {
      if (!INVITE_PATTERN.test(inviteKey)) return showError("รหัสเชิญไม่ถูกต้อง กรุณาคัดลอกจากผู้ดูแลที่ส่งให้ใหม่อีกครั้ง");
      if (!trimmed || new TextEncoder().encode(trimmed).length > MAX_NAME_BYTES) return showError("ชื่อไม่ถูกต้อง ภาษาอังกฤษไม่เกิน 30 ตัว ภาษาไทยไม่เกิน 10 ตัว");
      if (password !== confirm) return showError("รหัสผ่านไม่ตรงกัน");
    }

    setIsLoading(true);
    try {
      let uid: string;
      if (isRegister) {
        uid = await redeemAdminInvite(inviteKey, trimmed, password);
      } else {
        uid = (await signInWithEmailAndPassword(auth, adminNameToEmail(trimmed), password)).user.uid;
        // ถูกถอนสิทธิ์แล้ว (บัญชียังอยู่ แต่ไม่มี admins/{uid}) — ออกจากระบบกันค้าง session
        if (!(await getDoc(doc(db, "admins", uid))).exists()) {
          await signOutUser();
          return showError("บัญชีนี้ไม่มีสิทธิ์ผู้ดูแลแล้ว");
        }
      }
      onAuthenticated(uid);
    } catch (err) {
      console.error("Admin auth error:", err);
      const code = (err as { code?: string }).code ?? "";
      showError(code === "permission-denied" ? "รหัสเชิญไม่ถูกต้อง หมดอายุ หรือถูกใช้ไปแล้ว ให้ขอรหัสเชิญใหม่จากผู้ดูแล" : authErrorMessage(code));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-svh flex flex-col items-center justify-center p-6 bg-slate-50 relative z-50">
      <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center">
        <ShieldCheck className="w-16 h-16 text-slate-800 mb-4" />
        <h1 className="text-2xl font-bold text-slate-800 mb-2">เจ้าหน้าที่เท่านั้น</h1>
        <p className="text-sm text-slate-500 mb-6 text-center">
          {isRegister ? "สมัครผู้ดูแลด้วยรหัสเชิญที่ได้รับจากผู้ดูแลระบบ" : "เข้าสู่ระบบหลังบ้านเพื่อดูข้อมูลผู้ป่วย"}
        </p>

        <div className="w-full grid grid-cols-2 gap-1 p-1 bg-slate-100 rounded-2xl mb-6" role="tablist">
          {(["login", "register"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={cn(
                "min-h-[44px] rounded-xl text-sm font-semibold transition-colors",
                mode === m ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {m === "login" ? "เข้าสู่ระบบ" : "สมัครด้วยรหัสเชิญ"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {isRegister && (
            <label className="text-sm font-semibold text-slate-600">
              รหัสเชิญ
              <input
                type="text"
                required
                autoComplete="off"
                spellCheck={false}
                className={cn(inputClasses, "font-mono text-sm")}
                value={key}
                onChange={(e) => setKey(e.target.value)}
              />
            </label>
          )}
          <label className="text-sm font-semibold text-slate-600">
            ชื่อผู้ใช้
            <input type="text" required autoComplete="username" className={inputClasses} value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="text-sm font-semibold text-slate-600">
            รหัสผ่าน{isRegister && " (อย่างน้อย 6 ตัว)"}
            <input
              type="password"
              required
              minLength={isRegister ? 6 : undefined}
              autoComplete={isRegister ? "new-password" : "current-password"}
              className={inputClasses}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {isRegister && (
            <label className="text-sm font-semibold text-slate-600">
              ยืนยันรหัสผ่าน
              <input type="password" required minLength={6} autoComplete="new-password" className={inputClasses} value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            </label>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full min-h-[56px] flex items-center justify-center gap-2 bg-slate-800 text-white rounded-2xl font-semibold shadow-md active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100"
          >
            {isLoading && <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />}
            {isRegister ? "สมัครผู้ดูแล" : "เข้าสู่ระบบ"}
          </button>
        </form>

        <button onClick={() => router.push("/")} className="mt-6 text-sm text-slate-500 underline">
          กลับหน้าหลัก
        </button>
      </div>
    </div>
  );
}
