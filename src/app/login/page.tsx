"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ChevronRight, User, KeyRound, Loader2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/lib/userStore";
import { db } from "@/lib/firebase";
import { MAX_NAME_BYTES, auth, authErrorMessage, nameToEmail } from "@/lib/auth";
import { doc, getDoc } from "firebase/firestore/lite";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

export default function Login() {
  const router = useRouter();
  const { loginOrSaveUser } = useUserStore();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isRegister = mode === "register";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    setError("");

    if (!trimmed) return;
    if (new TextEncoder().encode(trimmed).length > MAX_NAME_BYTES) {
      setError("ชื่อยาวเกินไป (ภาษาอังกฤษไม่เกิน 30 ตัว ภาษาไทยไม่เกิน 10 ตัว)");
      return;
    }
    if (isRegister && password !== confirm) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    setIsLoading(true);
    try {
      const email = nameToEmail(trimmed);
      let displayName = trimmed;
      let uid: string;
      if (isRegister) {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(cred.user, { displayName: trimmed });
        uid = cred.user.uid;
      } else {
        const cred = await signInWithEmailAndPassword(auth, email, password);
        displayName = cred.user.displayName || trimmed;
        uid = cred.user.uid;
      }

      // มีข้อมูลส่วนตัวแล้ว -> เข้าหน้าหลัก, ยังไม่มี -> ไปกรอกข้อมูลส่วนตัว
      let profile = null;
      try {
        const snap = await getDoc(doc(db, "users", uid));
        if (snap.exists() && snap.data().age && snap.data().gestationalWeeks) profile = snap.data();
      } catch (err) {
        console.error("Error loading profile:", err);
      }

      if (profile) {
        loginOrSaveUser({
          name: profile.name || displayName,
          age: profile.age,
          gestationalWeeks: profile.gestationalWeeks,
          gravida: profile.gravida || "1",
          expectedDeliveryDate: profile.expectedDeliveryDate,
        });
        router.replace("/");
      } else {
        router.replace("/onboarding");
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError(authErrorMessage((err as { code?: string }).code ?? ""));
      setIsLoading(false);
    }
  };

  const inputClasses = "w-full p-4 short:p-3 bg-white/60 backdrop-blur-sm rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent transition-all shadow-sm";
  const labelClasses = "block text-sm font-semibold text-slate-700/90 mb-2 short:mb-1.5 ml-1 flex items-center gap-2";

  return (
    <div className="min-h-svh flex flex-col justify-center py-8 short:py-4 px-6 relative overflow-hidden w-full max-w-md mx-auto">
      <div className="absolute top-0 right-0 w-64 h-64 bg-pink-200/40 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200/40 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/3" />

      <motion.header
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8 short:mb-4"
      >
        <h1 className="text-3xl short:text-2xl font-bold text-slate-800 tracking-tight text-balance">
          {isRegister ? "สมัครใช้งาน MomSafe" : "เข้าสู่ระบบ MomSafe"}
        </h1>
        <p className="text-slate-500 mt-2 short:mt-1 short:text-sm">
          {isRegister
            ? "ตั้งชื่อและรหัสผ่านสำหรับเข้าใช้งานครั้งต่อไป"
            : "ใส่ชื่อและรหัสผ่านที่เคยตั้งไว้"}
        </p>
      </motion.header>

      <div className="grid grid-cols-2 gap-1 p-1 bg-white/50 rounded-2xl mb-6 short:mb-4" role="tablist">
        {(["login", "register"] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => { setMode(m); setError(""); }}
            className={cn(
              "py-3 short:py-2.5 rounded-xl text-sm font-semibold transition-all",
              mode === m ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {m === "login" ? "เข้าสู่ระบบ" : "สมัครใช้งาน"}
          </button>
        ))}
      </div>

      <motion.form
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 short:gap-3"
      >
        <div>
          <label htmlFor="name" className={labelClasses}>
            <User className="w-4 h-4 text-pink-500" />
            ชื่อของคุณแม่ (หรือชื่อเล่น)
          </label>
          <input
            id="name"
            type="text" required autoComplete="username"
            className={inputClasses}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="password" className={labelClasses}>
            <KeyRound className="w-4 h-4 text-pink-500" />
            รหัสผ่าน
          </label>
          <input
            id="password"
            type="password" required minLength={6}
            autoComplete={isRegister ? "new-password" : "current-password"}
            className={inputClasses}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {isRegister && (
          <div>
            <label htmlFor="confirm" className={labelClasses}>
              <KeyRound className="w-4 h-4 text-pink-500" />
              ยืนยันรหัสผ่าน
            </label>
            <input
              id="confirm"
              type="password" required minLength={6} autoComplete="new-password"
              className={inputClasses}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
        )}

        {error && (
          <p role="alert" className="text-red-500 text-sm font-medium ml-1">{error}</p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-4 short:py-3 bg-slate-800 text-white rounded-2xl font-semibold shadow-xl shadow-slate-800/20 hover:bg-slate-700 active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 focus-visible:ring-offset-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              กำลังโหลด...
            </>
          ) : (
            <>
              {isRegister ? "สมัครใช้งาน" : "เข้าสู่ระบบ"}
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500/80 font-medium">
          <Lock className="w-3.5 h-3.5" />
          <span>ข้อมูลสุขภาพของคุณจะถูกจัดเก็บอย่างปลอดภัย</span>
        </div>
      </motion.form>
    </div>
  );
}
