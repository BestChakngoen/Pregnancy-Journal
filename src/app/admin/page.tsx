"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { collection, collectionGroup, doc, getDoc, getDocs, query, orderBy } from "firebase/firestore/lite";
import { db } from "@/lib/firebase";
import { auth, nameToEmail } from "@/lib/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Loader2, ChevronLeft, Download, ShieldCheck } from "lucide-react";
import { useAlertStore } from "@/lib/alertStore";
import AdminManager from "@/components/admin/AdminManager";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import PatientList from "@/components/admin/PatientList";
import { buildAnalytics, type HealthData, type PatientDoc } from "@/lib/analytics";

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [myUid, setMyUid] = useState("");
  const [deniedUid, setDeniedUid] = useState(""); // ล็อกอินได้แต่ยังไม่มีสิทธิ์: แสดง UID ให้เจ้าของโปรเจกต์นำไปเพิ่ม
  const [data, setData] = useState<HealthData>({ patients: [], bp: [], weights: [], kicks: [] });
  const [isLoading, setIsLoading] = useState(false);

  // สิทธิ์จริงอยู่ที่ Security Rules (มีเอกสาร admins/{uid} หรือไม่) หน้านี้แค่เช็คก่อนเพื่อแสดงข้อความ
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeniedUid("");
    const showError = (message: string) =>
      useAlertStore.getState().showAlert({ type: "error", title: "เกิดข้อผิดพลาด", message });
    let uid: string;
    try {
      uid = (await signInWithEmailAndPassword(auth, nameToEmail(name.trim()), password)).user.uid;
    } catch {
      showError("ชื่อหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
      return;
    }
    try {
      if (!(await getDoc(doc(db, "admins", uid))).exists()) {
        setDeniedUid(uid);
        return;
      }
    } catch {
      showError("ตรวจสอบสิทธิ์ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      return;
    }
    setMyUid(uid);
    setIsAuthenticated(true);
    fetchUsers();
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // shortcut: ดึงบันทึกสุขภาพของทุกคนทีเดียว — ถ้าข้อมูลถึงหลายพันรายการ ให้กรองช่วงวันที่ใน query (ต้องสร้าง collection-group index)
      const [snapshot, ...groups] = await Promise.all([
        getDocs(query(collection(db, "users"), orderBy("createdAt", "desc"))),
        getDocs(collectionGroup(db, "bloodPressures")),
        getDocs(collectionGroup(db, "weights")),
        getDocs(collectionGroup(db, "kicks")),
      ]);
      const patients = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as PatientDoc);
      const ids = new Set(patients.map((u) => u.id));
      // uid เจ้าของ = เอกสาร users/{uid} ที่ครอบอยู่; เก็บเฉพาะผู้ป่วยในรายชื่อ (ไม่นับข้อมูลเก่าที่ค้าง)
      const [bp, weights, kicks] = groups.map((g) =>
        g.docs.map((d) => ({ uid: d.ref.parent.parent?.id ?? "", ...d.data() })).filter((x) => ids.has(x.uid))
      );
      setData({ patients, bp, weights, kicks } as HealthData);
    } catch (err) {
      console.error("Error fetching users:", err);
      setData({ patients: [], bp: [], weights: [], kicks: [] });
      useAlertStore.getState().showAlert({
        type: "error",
        title: "โหลดข้อมูลไม่สำเร็จ",
        message: "ไม่มีสิทธิ์อ่านข้อมูล หรือการเชื่อมต่อมีปัญหา",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-svh flex flex-col items-center justify-center p-6 bg-slate-50 relative z-50">
        <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl flex flex-col items-center">
          <ShieldCheck className="w-16 h-16 text-slate-800 mb-4" />
          <h1 className="text-2xl font-bold text-slate-800 mb-2">เจ้าหน้าที่เท่านั้น</h1>
          <p className="text-sm text-slate-500 mb-6 text-center">เข้าสู่ระบบหลังบ้านเพื่อดูข้อมูลผู้ป่วย</p>
          
          <form onSubmit={handleLogin} className="w-full flex flex-col gap-4">
            <label className="text-sm font-semibold text-slate-600">
              ชื่อผู้ใช้
              <input
                type="text"
                required
                autoComplete="username"
                className="mt-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-800 focus:outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="text-sm font-semibold text-slate-600">
              รหัสผ่าน
              <input 
                type="password" 
                required
                autoComplete="current-password"
                className="mt-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-slate-800 focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <button type="submit" className="w-full py-4 bg-slate-800 text-white rounded-2xl font-semibold shadow-md active:scale-95 transition-all">
              เข้าสู่ระบบ
            </button>
          </form>

          {deniedUid && (
            <div className="w-full mt-4 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900">
              <p className="text-sm font-semibold">บัญชีนี้ยังไม่มีสิทธิ์ผู้ดูแล</p>
              <p className="text-xs mt-1">
                คัดลอกรหัสนี้ส่งให้ผู้ดูแลระบบ เพื่อเพิ่มสิทธิ์ในหน้านี้ (ถ้ายังไม่มีผู้ดูแลเลย ให้เพิ่มใน Firebase Console → Firestore → collection <b>admins</b> โดยใช้รหัสนี้เป็น Document ID)
              </p>
              <div className="mt-2 flex items-center gap-2">
                <code className="flex-1 min-w-0 break-all select-all bg-white rounded-lg px-2 py-1 text-xs">{deniedUid}</code>
                <button
                  type="button"
                  onClick={() => navigator.clipboard?.writeText(deniedUid)}
                  className="shrink-0 min-h-[44px] px-3 rounded-lg bg-amber-200 text-xs font-semibold"
                >
                  คัดลอก
                </button>
              </div>
            </div>
          )}
          
          <button onClick={() => router.push("/")} className="mt-6 text-sm text-slate-500 underline">
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-svh flex flex-col bg-slate-50 relative z-50">
      <header className="px-4 py-4 flex items-center justify-between bg-white shadow-sm sticky top-0 z-10 print:hidden">
        <button onClick={() => router.push("/")} className="w-10 h-10 flex items-center justify-center text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-slate-800">ข้อมูลผู้ป่วย (Admin)</h1>
        <button 
          onClick={() => window.print()}
          className="w-10 h-10 flex items-center justify-center text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors" title="Export PDF"
        >
          <Download className="w-5 h-5" />
        </button>
      </header>

      <main className="p-4 flex flex-col gap-4">
        <AdminManager myUid={myUid} />

        {isLoading ? (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
          </div>
        ) : (
          <>
            <h2 className="text-sm font-semibold text-slate-600 mt-2 ml-1">ภาพรวมผู้ป่วย</h2>
            <AdminAnalytics a={buildAnalytics(data)} />

            <h2 className="text-sm font-semibold text-slate-600 mt-2 ml-1">รายชื่อผู้ป่วยล่าสุด</h2>
            <PatientList data={data} />
          </>
        )}
      </main>
    </div>
  );
}
