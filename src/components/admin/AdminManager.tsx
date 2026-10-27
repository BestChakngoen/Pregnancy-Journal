"use client";

import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, getDocs, serverTimestamp, setDoc } from "firebase/firestore/lite";
import { Check, Copy, KeyRound, Loader2, ShieldPlus, Trash2 } from "lucide-react";
import { db } from "@/lib/firebase";
import { INVITE_HOURS, newInviteKey } from "@/lib/userAdmin";
import { useAlertStore } from "@/lib/alertStore";

interface AdminDoc {
  id: string;
  name?: string;
  addedAt?: string;
}

interface InviteDoc {
  id: string; // id เอกสาร = รหัสเชิญ
  createdAt: number; // ms
}

const expiryText = (createdAt: number) =>
  new Date(createdAt + INVITE_HOURS * 3_600_000).toLocaleString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

const iconButton = "w-11 h-11 flex items-center justify-center rounded-full";

// สิทธิ์จริงตรวจโดย firestore.rules (match /admins, /invites) — ที่นี่แค่แสดงรายการ
// demoAdmins = โหมดตัวอย่าง: ใช้รายชื่อนี้แทน Firestore และสร้างรหัสเชิญ/ถอนได้เฉพาะในหน้า (รีเฟรชแล้วกลับเหมือนเดิม)
export default function AdminManager({ myUid, demoAdmins }: { myUid: string; demoAdmins?: AdminDoc[] }) {
  const [admins, setAdmins] = useState<AdminDoc[]>(demoAdmins ?? []);
  const [invites, setInvites] = useState<InviteDoc[]>([]);
  const [isLoading, setIsLoading] = useState(!demoAdmins);
  const [isSaving, setIsSaving] = useState(false);
  const [copiedKey, setCopiedKey] = useState("");

  const showAlert = useAlertStore.getState().showAlert;

  const load = () =>
    Promise.all([getDocs(collection(db, "admins")), getDocs(collection(db, "invites"))])
      .then(([adminSnap, inviteSnap]) => {
        setAdmins(
          adminSnap.docs
            .map((d) => ({ id: d.id, ...d.data() }) as AdminDoc)
            .sort((a, b) => (a.addedAt ?? "").localeCompare(b.addedAt ?? ""))
        );
        setInvites(
          inviteSnap.docs
            .map((d) => ({ id: d.id, createdAt: d.data().createdAt?.toMillis() ?? 0 }))
            .sort((a, b) => a.createdAt - b.createdAt)
        );
      })
      .catch((err) => {
        console.error("Error fetching admins:", err);
        showAlert({ type: "error", title: "โหลดรายชื่อผู้ดูแลไม่สำเร็จ", message: "กรุณาลองใหม่อีกครั้ง" });
      })
      .finally(() => setIsLoading(false));

  useEffect(() => {
    if (!demoAdmins) load();
  }, []);

  const handleCreateInvite = async () => {
    const key = newInviteKey();
    if (demoAdmins) {
      setInvites((xs) => [...xs, { id: key, createdAt: Date.now() }]);
      return;
    }
    setIsSaving(true);
    try {
      await setDoc(doc(db, "invites", key), { createdBy: myUid, createdAt: serverTimestamp() });
      await load();
    } catch (err) {
      console.error("Error creating invite:", err);
      showAlert({ type: "error", title: "สร้างรหัสเชิญไม่สำเร็จ", message: "ไม่มีสิทธิ์ หรือการเชื่อมต่อมีปัญหา" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopy = (key: string) => {
    navigator.clipboard?.writeText(key);
    setCopiedKey(key);
  };

  const handleRevokeInvite = async (key: string) => {
    if (demoAdmins) {
      setInvites((xs) => xs.filter((i) => i.id !== key));
      return;
    }
    try {
      await deleteDoc(doc(db, "invites", key));
      await load();
    } catch (err) {
      console.error("Error revoking invite:", err);
      showAlert({ type: "error", title: "ยกเลิกรหัสเชิญไม่สำเร็จ", message: "ไม่มีสิทธิ์ หรือการเชื่อมต่อมีปัญหา" });
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
          await load();
        } catch (err) {
          console.error("Error removing admin:", err);
          showAlert({ type: "error", title: "ถอนสิทธิ์ไม่สำเร็จ", message: "ไม่มีสิทธิ์ หรือการเชื่อมต่อมีปัญหา" });
        }
      },
    });
  };

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
                  className={`${iconButton} shrink-0 text-red-500 hover:bg-red-50`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
        <p className="text-xs font-semibold text-slate-600 flex items-center gap-2">
          <KeyRound className="w-4 h-4" aria-hidden="true" /> เชิญผู้ดูแลคนใหม่
        </p>
        <p className="text-xs text-slate-500">
          สร้างรหัสเชิญแล้วส่งให้คนที่จะเป็นผู้ดูแล เขาเปิดหน้านี้ เลือกแท็บ &quot;สมัครด้วยรหัสเชิญ&quot; แล้วตั้งชื่อและรหัสผ่านเอง รหัสเชิญใช้ได้ครั้งเดียว หมดอายุใน {INVITE_HOURS} ชั่วโมง
        </p>

        {invites.length > 0 && (
          <ul className="flex flex-col divide-y divide-slate-100">
            {invites.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-2 py-2">
                <div className="min-w-0">
                  <p className="text-xs font-mono text-slate-800 break-all select-all">{i.id}</p>
                  <p className="text-xs text-slate-500">หมดอายุ {expiryText(i.createdAt)}</p>
                </div>
                <div className="shrink-0 flex">
                  <button onClick={() => handleCopy(i.id)} aria-label="คัดลอกรหัสเชิญ" className={`${iconButton} text-slate-600 hover:bg-slate-100`}>
                    {copiedKey === i.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button onClick={() => handleRevokeInvite(i.id)} aria-label="ยกเลิกรหัสเชิญ" className={`${iconButton} text-red-500 hover:bg-red-50`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <button
          type="button"
          onClick={handleCreateInvite}
          disabled={isSaving}
          className="w-full min-h-[44px] bg-slate-800 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
        >
          {isSaving ? "กำลังสร้าง..." : "สร้างรหัสเชิญ"}
        </button>
      </div>
    </section>
  );
}
