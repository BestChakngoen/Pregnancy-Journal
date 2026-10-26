"use client";

import { useEffect, useState } from "react";
import { Loader2, TriangleAlert } from "lucide-react";
import Portal from "@/components/ui/Portal";

// กันลบพลาด: ปุ่มลบกดได้ต่อเมื่อพิมพ์ชื่อผู้ใช้ตรงเป๊ะ
export default function DeletePatientDialog({
  name,
  onConfirm,
  onClose,
}: {
  name: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}) {
  const [typed, setTyped] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !isDeleting && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isDeleting, onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typed.trim() !== name) return;
    setIsDeleting(true);
    setError("");
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error("Error deleting patient:", err);
      setError("ลบไม่สำเร็จ ไม่มีสิทธิ์ หรือการเชื่อมต่อมีปัญหา (ข้อมูลบางส่วนอาจถูกลบไปแล้ว ลองกดลบซ้ำได้)");
      setIsDeleting(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[100]" onClick={() => !isDeleting && onClose()} />
      <div className="fixed inset-0 flex items-center justify-center px-6 z-[101] pointer-events-none">
        <form
          onSubmit={handleSubmit}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-patient-title"
          aria-describedby="delete-patient-desc"
          className="bg-white w-full max-w-sm rounded-3xl shadow-2xl pointer-events-auto p-6 flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="shrink-0 w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center">
              <TriangleAlert className="w-6 h-6 text-rose-600" aria-hidden="true" />
            </div>
            <h3 id="delete-patient-title" className="text-lg font-bold text-slate-800">
              ลบบัญชีผู้ใช้
            </h3>
          </div>

          <p id="delete-patient-desc" className="text-sm text-slate-600 leading-relaxed">
            โปรไฟล์ ผลแบบทดสอบ และบันทึกสุขภาพทั้งหมดของ <b className="text-slate-900 break-all">{name}</b> จะถูกลบถาวร กู้คืนไม่ได้
            (บัญชีล็อกอินยังอยู่ ถ้าเจ้าของเข้าสู่ระบบอีกจะเริ่มกรอกข้อมูลใหม่)
          </p>

          <label className="text-sm font-semibold text-slate-700">
            พิมพ์ชื่อ <span className="text-rose-700 break-all">{name}</span> เพื่อยืนยัน
            <input
              autoFocus
              required
              autoComplete="off"
              className="mt-1 w-full p-3 bg-slate-100 rounded-xl text-sm font-normal focus:ring-2 focus:ring-rose-600 focus:outline-none"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
            />
          </label>

          {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="w-full min-h-[44px] text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl text-sm font-semibold disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isDeleting || typed.trim() !== name}
              className="w-full min-h-[44px] flex items-center justify-center gap-2 text-white bg-rose-600 hover:bg-rose-700 rounded-xl text-sm font-semibold disabled:opacity-40"
            >
              {isDeleting && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
              {isDeleting ? "กำลังลบ..." : "ลบถาวร"}
            </button>
          </div>
        </form>
      </div>
    </Portal>
  );
}
