"use client";

import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs, setDoc } from "firebase/firestore/lite";
import { Loader2, ShieldPlus, Trash2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { MAX_NAME_BYTES, authErrorMessage, createAccount } from "@/lib/auth";
import { useAlertStore } from "@/lib/alertStore";

interface AdminDoc {
  id: string;
  name?: string;
  addedAt?: string;
}

// uid ของ Firebase เป็นตัวอักษร/ตัวเลข 20-128 ตัว — กันวางผิด/วางเกินมา
const UID_PATTERN = /^[A-Za-z0-9]{20,128}$/;

// สิทธิ์จริงตรวจโดย firestore.rules (match /admins) — ที่นี่แค่เช็คก่อนเพื่อแสดงข้อความ
// demoAdmins = โหมดตัวอย่าง: ใช้รายชื่อนี้แทน Firestore และเพิ่ม/ถอนได้เฉพาะในหน้า (รีเฟรชแล้วกลับเหมือนเดิม)
export default function AdminManager({ myUid, demoAdmins }: { myUid: string; demoAdmins?: AdminDoc[] }) {
  const [admins, setAdmins] = useState<AdminDoc[]>(demoAdmins ?? []);
  const [isLoading, setIsLoading] = useState(!demoAdmins);
  const [uid, setUid] = useState("");
  const [name, setName] = useState("");
  const [createName, setCreateName] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const showAlert = useAlertStore.getState().showAlert;

  const fetchAdmins = () =>
    getDocs(collection(db, "admins"))
      .then((snap) =>
        setAdmins(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }) as AdminDoc)
            .sort((a, b) => (a.addedAt ?? "").localeCompare(b.addedAt ?? ""))
        )
      )
      .catch((err) => {
        console.error("Error fetching admins:", err);
        showAlert({ type: "error", title: "โหลดรายชื่อผู้ดูแลไม่สำเร็จ", message: "กรุณาลองใหม่อีกครั้ง" });
      })
      .finally(() => setIsLoading(false));

  useEffect(() => {
    if (!demoAdmins) fetchAdmins();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const newUid = uid.trim();
    const newName = name.trim();
    if (!UID_PATTERN.test(newUid)) {
      showAlert({ type: "error", title: "รหัส UID ไม่ถูกต้อง", message: "คัดลอก UID จากหน้าจอของผู้ที่ต้องการเพิ่มมาวางใหม่อีกครั้ง" });
      return;
    }
    if (admins.some((a) => a.id === newUid)) {
      showAlert({ type: "info", title: "เป็นผู้ดูแลอยู่แล้ว", message: "บัญชีนี้มีสิทธิ์ผู้ดูแลอยู่แล้ว" });
      return;
    }

    if (demoAdmins) {
      setAdmins([...admins, { id: newUid, name: newName }]);
      setUid("");
      setName("");
      showAlert({ type: "success", title: "เพิ่มผู้ดูแลแล้ว (โหมดตัวอย่าง)", message: "ยังไม่ได้บันทึกลงระบบจริง รีเฟรชหน้าแล้วรายการจะกลับเป็นเหมือนเดิม" });
      return;
    }

    setIsSaving(true);
    try {
      await setDoc(doc(db, "admins", newUid), { name: newName, addedBy: myUid, addedAt: new Date().toISOString() });
      setUid("");
      setName("");
      await fetchAdmins();
      showAlert({ type: "success", title: "เพิ่มผู้ดูแลแล้ว", message: `ให้ ${newName} ล็อกอินที่หน้านี้ใหม่อีกครั้ง` });
    } catch (err) {
      console.error("Error adding admin:", err);
      showAlert({ type: "error", title: "เพิ่มผู้ดูแลไม่สำเร็จ", message: "ไม่มีสิทธิ์ หรือการเชื่อมต่อมีปัญหา" });
    } finally {
      setIsSaving(false);
    }
  };

  // สร้างบัญชีล็อกอิน + สิทธิ์ผู้ดูแลในขั้นเดียว: ผู้ดูแลคนใหม่ไม่ต้องสมัครในแอปก่อน
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const newName = createName.trim();
    if (!newName || new TextEncoder().encode(newName).length > MAX_NAME_BYTES) {
      showAlert({ type: "error", title: "ชื่อไม่ถูกต้อง", message: "ภาษาอังกฤษไม่เกิน 30 ตัว ภาษาไทยไม่เกิน 10 ตัว" });
      return;
    }

    if (demoAdmins) {
      setAdmins([...admins, { id: crypto.randomUUID().replaceAll("-", ""), name: newName }]);
      setCreateName("");
      setCreatePassword("");
      showAlert({ type: "success", title: "สร้างผู้ดูแลแล้ว (โหมดตัวอย่าง)", message: "ยังไม่ได้บันทึกลงระบบจริง รีเฟรชหน้าแล้วรายการจะกลับเป็นเหมือนเดิม" });
      return;
    }

    setIsSaving(true);
    let newUid = "";
    try {
      newUid = await createAccount(newName, createPassword);
      await setDoc(doc(db, "admins", newUid), { name: newName, addedBy: myUid, addedAt: new Date().toISOString() });
      setCreateName("");
      setCreatePassword("");
      await fetchAdmins();
      showAlert({ type: "success", title: "สร้างผู้ดูแลแล้ว", message: `ให้ ${newName} ล็อกอินที่หน้านี้ด้วยชื่อและรหัสผ่านที่ตั้งไว้` });
    } catch (err) {
      console.error("Error creating admin:", err);
      // บัญชีสร้างแล้วแต่ตั้งสิทธิ์ไม่สำเร็จ: ให้ UID ไปลองใหม่ที่ฟอร์มด้านล่างได้ (ชื่อถูกใช้ไปแล้วสร้างซ้ำไม่ได้)
      showAlert({
        type: "error",
        title: "สร้างผู้ดูแลไม่สำเร็จ",
        message: newUid
          ? `สร้างบัญชีแล้วแต่ตั้งสิทธิ์ไม่สำเร็จ ให้นำรหัส UID นี้ไปเพิ่มในฟอร์มด้านล่าง: ${newUid}`
          : authErrorMessage((err as { code?: string }).code ?? ""),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = (target: AdminDoc) => {
    showAlert({
      type: "warning",
      title: "ถอนสิทธิ์ผู้ดูแล",
      message: `ต้องการถอนสิทธิ์ของ ${target.name || target.id} ใช่หรือไม่?`,
      confirmText: "ถอนสิทธิ์",
      showCancelButton: true,
      onConfirm: async () => {
        if (demoAdmins) {
          setAdmins((xs) => xs.filter((a) => a.id !== target.id));
          return;
        }
        try {
          await deleteDoc(doc(db, "admins", target.id));
          await fetchAdmins();
        } catch (err) {
          console.error("Error removing admin:", err);
          showAlert({ type: "error", title: "ถอนสิทธิ์ไม่สำเร็จ", message: "ไม่มีสิทธิ์ หรือการเชื่อมต่อมีปัญหา" });
        }
      },
    });
  };

  const inputClasses = "w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-800 focus:outline-none";

  return (
    <section className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3 print:hidden">
      <h2 className="text-sm font-semibold text-slate-600 flex items-center gap-2">
        <ShieldPlus className="w-4 h-4" /> ผู้ดูแลระบบ
      </h2>

      {isLoading ? (
        <Loader2 className="w-5 h-5 text-slate-500 animate-spin self-center" aria-label="กำลังโหลด" />
      ) : (
        <ul className="flex flex-col divide-y divide-slate-100">
          {admins.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-2 py-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {a.name || "(ไม่มีชื่อ)"} {a.id === myUid && <span className="text-xs font-normal text-slate-500">(คุณ)</span>}
                </p>
                <p className="text-xs text-slate-500 truncate">{a.id}</p>
              </div>
              {a.id !== myUid && (
                <button
                  onClick={() => handleRemove(a)}
                  aria-label={`ถอนสิทธิ์ ${a.name || a.id}`}
                  className="shrink-0 w-11 h-11 flex items-center justify-center rounded-full text-red-500 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleCreate} className="flex flex-col gap-2 pt-2 border-t border-slate-100">
        <p className="text-xs font-semibold text-slate-600">สร้างบัญชีผู้ดูแลใหม่</p>
        <p className="text-xs text-slate-500">ตั้งชื่อและรหัสผ่านให้ผู้ดูแลคนใหม่ได้เลย ไม่ต้องสมัครในแอปก่อน แล้วแจ้งทั้งสองอย่างให้เขาไปล็อกอินที่หน้านี้</p>
        <label className="text-xs font-semibold text-slate-600">
          ชื่อผู้ดูแล (ใช้ล็อกอินและแสดงในรายชื่อ)
          <input required autoComplete="off" className={`${inputClasses} mt-1`} value={createName} onChange={(e) => setCreateName(e.target.value)} />
        </label>
        <label className="text-xs font-semibold text-slate-600">
          รหัสผ่าน (อย่างน้อย 6 ตัว)
          <input required minLength={6} autoComplete="off" className={`${inputClasses} mt-1 font-mono`} value={createPassword} onChange={(e) => setCreatePassword(e.target.value)} />
        </label>
        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3 bg-slate-800 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
        >
          {isSaving ? "กำลังสร้าง..." : "สร้างผู้ดูแล"}
        </button>
      </form>

      <form onSubmit={handleAdd} className="flex flex-col gap-2 pt-2 border-t border-slate-100">
        <p className="text-xs font-semibold text-slate-600">หรือเพิ่มจากบัญชีที่สมัครในแอปไว้แล้ว</p>
        <p className="text-xs text-slate-500">
          ให้ผู้ที่ต้องการเป็นผู้ดูแลสมัครบัญชีในแอป แล้วล็อกอินที่หน้านี้ จะเห็นรหัส UID ให้คัดลอกส่งมา
        </p>
        <label className="text-xs font-semibold text-slate-600">
          รหัส UID
          <input required className={`${inputClasses} mt-1 font-mono`} value={uid} onChange={(e) => setUid(e.target.value)} />
        </label>
        <label className="text-xs font-semibold text-slate-600">
          ชื่อผู้ดูแล (แสดงในรายชื่อ)
          <input required maxLength={100} className={`${inputClasses} mt-1`} value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3 bg-slate-800 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
        >
          {isSaving ? "กำลังเพิ่ม..." : "เพิ่มผู้ดูแล"}
        </button>
      </form>
    </section>
  );
}
