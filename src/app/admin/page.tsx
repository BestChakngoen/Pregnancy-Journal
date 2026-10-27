"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { collection, collectionGroup, getDocs, query, orderBy } from "firebase/firestore/lite";
import { db } from "@/lib/firebase";
import { signOutUser } from "@/lib/auth";
import { Loader2, LogOut, Printer, RefreshCw, WifiOff } from "lucide-react";
import AdminAuthForm from "@/components/admin/AdminAuthForm";
import AdminManager from "@/components/admin/AdminManager";
import AdminAnalytics from "@/components/admin/AdminAnalytics";
import PatientList from "@/components/admin/PatientList";
import { buildAnalytics, type HealthData, type PatientDoc } from "@/lib/analytics";
import { DEMO_ADMINS, buildDemoData } from "@/lib/demoData";
import { deletePatient } from "@/lib/userAdmin";
import { cn } from "@/lib/utils";

const noopSubscribe = () => () => {};
const EMPTY: HealthData = { patients: [], bp: [], weights: [], kicks: [] };

type TabId = "patients" | "study" | "admins";
const TABS: { id: TabId; label: string }[] = [
  { id: "patients", label: "ติดตามผู้ป่วย" },
  { id: "study", label: "ผลการศึกษา" },
  { id: "admins", label: "ผู้ดูแลระบบ" },
];

const dateTime = (d: Date) =>
  d.toLocaleString("th-TH", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });

function HeaderButton({ label, icon: Icon, onClick, spin }: { label: string; icon: typeof LogOut; onClick: () => void; spin?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="min-h-[44px] min-w-[44px] px-2.5 sm:px-3 flex items-center justify-center gap-1.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
    >
      <Icon className={cn("w-5 h-5", spin && "animate-spin")} aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [myUid, setMyUid] = useState("");
  const [data, setData] = useState<HealthData>(EMPTY);
  const [isLoading, setIsLoading] = useState(false);
  const [loadedAt, setLoadedAt] = useState<Date | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [tab, setTab] = useState<TabId>("patients");
  // /admin?demo=1 = ดูหน้าด้วยข้อมูลตัวอย่าง ไม่ต้องล็อกอิน (ข้อมูลสร้างในเครื่อง ไม่แตะ Firebase)
  const isDemo = useSyncExternalStore(noopSubscribe, () => new URLSearchParams(location.search).has("demo"), () => false);
  const shown = useMemo(() => (isDemo ? buildDemoData() : data), [isDemo, data]);
  // เวลาอ้างอิงของ "x วันก่อน" / ช่วง 30 วัน = เวลาที่ได้ข้อมูลชุดนี้มา
  const dataAt = useMemo(() => (isDemo ? new Date() : loadedAt), [isDemo, loadedAt]);

  // สิทธิ์จริงอยู่ที่ Security Rules (บัญชีโดเมน admin + เอกสาร admins/{uid}) AdminAuthForm แค่เช็คก่อนเพื่อแสดงข้อความ
  const handleAuthenticated = (uid: string) => {
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
      setLoadedAt(new Date());
      setLoadError(false);
    } catch (err) {
      // ไม่ล้างข้อมูลเดิม: โหลดซ้ำพังยังเห็นข้อมูลชุดก่อนพร้อมเวลา, ไม่เคยโหลดได้เลยก็ไม่แสดงเลข 0 ที่ดูเหมือน "ไม่มีใครเสี่ยง"
      console.error("Error fetching users:", err);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // ลบใน Firestore แล้วตัดออกจากข้อมูลที่โหลดไว้เลย ไม่ต้องดึงบันทึกของทุกคนใหม่
  const handleDeletePatient = async (uid: string) => {
    await deletePatient(uid);
    setData((d) => ({
      patients: d.patients.filter((p) => p.id !== uid),
      bp: d.bp.filter((x) => x.uid !== uid),
      weights: d.weights.filter((x) => x.uid !== uid),
      kicks: d.kicks.filter((x) => x.uid !== uid),
    }));
  };

  const handleLogout = async () => {
    // โหมดตัวอย่างอ่านจาก ?demo=1 ใน URL ตอนเรนเดอร์ จึงต้องโหลดหน้าใหม่ทั้งหน้าเพื่อกลับไปหน้าล็อกอิน
    if (isDemo) {
      window.location.href = "/admin";
      return;
    }
    await signOutUser();
    setIsAuthenticated(false);
    setMyUid("");
    setData(EMPTY);
    setLoadedAt(null);
    setLoadError(false);
    setTab("patients");
  };

  if (!isAuthenticated && !isDemo) {
    return <AdminAuthForm onAuthenticated={handleAuthenticated} />;
  }

  const tabLabel = TABS.find((t) => t.id === tab)!.label;

  const content = () => {
    if (tab === "admins") return isDemo ? <AdminManager myUid={DEMO_ADMINS[0].id} demoAdmins={DEMO_ADMINS} /> : <AdminManager myUid={myUid} />;
    if (!dataAt) {
      if (loadError) {
        return (
          <div role="alert" className="bg-white border border-red-200 rounded-2xl p-6 flex flex-col items-center text-center gap-3">
            <WifiOff className="w-8 h-8 text-red-700" aria-hidden="true" />
            <div>
              <h2 className="font-semibold text-slate-900">โหลดข้อมูลผู้ป่วยไม่สำเร็จ</h2>
              <p className="text-sm text-slate-600 mt-1">ตรวจสอบอินเทอร์เน็ตแล้วลองใหม่ ถ้ายังไม่ได้ บัญชีนี้อาจยังไม่มีสิทธิ์อ่านข้อมูลผู้ป่วย</p>
            </div>
            <button type="button" onClick={fetchUsers} className="min-h-[44px] px-5 rounded-xl bg-slate-800 text-white font-semibold hover:bg-slate-700">
              ลองใหม่
            </button>
          </div>
        );
      }
      return (
        <div role="status" className="py-16 flex flex-col items-center gap-3 text-sm text-slate-600">
          <Loader2 className="w-8 h-8 text-slate-500 animate-spin" aria-hidden="true" />
          กำลังโหลดข้อมูลผู้ป่วย…
        </div>
      );
    }
    return tab === "patients" ? <PatientList data={shown} now={dataAt} onDelete={isDemo ? undefined : handleDeletePatient} /> : <AdminAnalytics a={buildAnalytics(shown, dataAt)} />;
  };

  return (
    <div data-admin className="min-h-svh flex flex-col bg-slate-50 print:bg-white relative z-50">
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200 print:hidden">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="flex items-center gap-1 py-2">
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-bold text-slate-900 truncate">ข้อมูลผู้ป่วย MomSafe</h1>
              <p role="status" className="text-xs text-slate-500 truncate">
                {isDemo ? "ข้อมูลตัวอย่าง (ไม่ใช่ข้อมูลจริง)" : isLoading ? "กำลังโหลดข้อมูล…" : loadedAt ? `ข้อมูล ณ ${dateTime(loadedAt)}` : ""}
              </p>
            </div>
            {!isDemo && <HeaderButton label="โหลดใหม่" icon={RefreshCw} onClick={fetchUsers} spin={isLoading} />}
            <HeaderButton label="พิมพ์" icon={Printer} onClick={() => window.print()} />
            <HeaderButton label="ออกจากระบบ" icon={LogOut} onClick={handleLogout} />
          </div>
          <div role="tablist" aria-label="ส่วนของหน้า" className="flex gap-1 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`tab-${t.id}`}
                aria-selected={tab === t.id}
                aria-controls="admin-panel"
                onClick={() => setTab(t.id)}
                className={cn(
                  "min-h-[44px] px-3 text-sm font-semibold border-b-2 whitespace-nowrap transition-colors",
                  tab === t.id ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-800"
                )}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main id="admin-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="max-w-6xl mx-auto w-full px-4 md:px-6 py-4 md:py-6 flex flex-col gap-4">
        {/* หัวรายงานเฉพาะตอนพิมพ์ */}
        <div className="hidden print:block">
          <h1 className="text-xl font-bold text-slate-900">รายงาน MomSafe · {tabLabel}</h1>
          <p className="text-sm text-slate-600">
            พิมพ์เมื่อ {dateTime(new Date())}
            {loadedAt && ` · ข้อมูล ณ ${dateTime(loadedAt)}`}
          </p>
        </div>

        {isDemo && (
          <p className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm font-semibold text-amber-900">
            โหมดตัวอย่าง: ข้อมูลสมมติ ผู้ป่วย 20 คน และผู้ดูแล 5 คน ไม่ใช่ข้อมูลจริง (สร้างรหัสเชิญ/ถอนผู้ดูแลได้ แต่ไม่ถูกบันทึก)
          </p>
        )}

        {loadError && dataAt && tab !== "admins" && (
          <div role="alert" className="flex flex-wrap items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-2xl text-sm text-red-900 print:hidden">
            <WifiOff className="w-5 h-5 shrink-0" aria-hidden="true" />
            <span className="flex-1 min-w-0">โหลดข้อมูลใหม่ไม่สำเร็จ กำลังแสดงข้อมูล ณ {dateTime(dataAt)}</span>
            <button type="button" onClick={fetchUsers} className="min-h-[44px] px-4 rounded-xl bg-white border border-red-200 font-semibold hover:bg-red-100">
              ลองใหม่
            </button>
          </div>
        )}

        {content()}
      </main>
    </div>
  );
}
