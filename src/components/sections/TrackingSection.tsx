"use client";

import { useState, useEffect } from "react";
import { Activity, AlertTriangle, TrendingUp, Scale, Baby } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { useUserStore } from "@/lib/userStore";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, getDocs, limit } from "firebase/firestore";
import { cn } from "@/lib/utils";
import FloatingParticles from "@/components/ui/FloatingParticles";

interface BPLog {
  timestamp: string;
  systolic: number;
  diastolic: number;
  isHighRisk: boolean;
  displayDate?: string;
}

type TabType = "bp" | "weight" | "kicks";

const TABS = [
  { id: "bp", label: "ความดัน", icon: Activity },
  { id: "weight", label: "น้ำหนัก", icon: Scale },
  { id: "kicks", label: "ลูกดิ้น", icon: Baby }
];

export default function TrackingSection() {
  const { user } = useUserStore();
  const [activeTab, setActiveTab] = useState<TabType>("bp");
  
  // BP State
  const [logs, setLogs] = useState<BPLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.name || activeTab !== "bp") return;
    fetchLogs();
    window.addEventListener("bp-logged", fetchLogs);
    return () => window.removeEventListener("bp-logged", fetchLogs);
  }, [user, activeTab]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const logsRef = collection(db, "users", user!.name.toLowerCase(), "bloodPressures");
      const q = query(logsRef, orderBy("timestamp", "asc"), limit(30));
      const snapshot = await getDocs(q);
      
      const fetchedLogs: BPLog[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        const date = new Date(data.timestamp);
        fetchedLogs.push({
          ...data,
          systolic: data.systolic,
          diastolic: data.diastolic,
          isHighRisk: data.isHighRisk,
          displayDate: `${date.getDate()}/${date.getMonth() + 1}`,
        } as BPLog);
      });

      setLogs(fetchedLogs);
    } catch (err) {
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const latestBP = logs[logs.length - 1];
  const isBPDanger = latestBP?.isHighRisk;

      const renderBP = () => (
    <>
      {latestBP && (
        <div className={cn(
          "p-6 rounded-[2rem] flex items-center justify-between shadow-sm relative overflow-hidden shrink-0",
          isBPDanger ? "bg-red-50/80 border border-white/60" : "bg-gradient-to-br from-blue-50/80 to-pink-50/80 border border-white/60"
        )}>
          {isBPDanger && <FloatingParticles count={10} />}
          <div className="relative z-10 flex flex-col">
            <span className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
              {isBPDanger ? <AlertTriangle className="w-4 h-4 text-red-500" /> : <Activity className="w-4 h-4 text-blue-500" />}
              ความดันล่าสุด ({latestBP.displayDate})
            </span>
            <div className="flex items-end gap-1.5">
              <span className={cn("text-4xl font-bold tracking-tight tabular-nums", isBPDanger ? "text-red-600" : "text-slate-800")}>
                {latestBP.systolic}/{latestBP.diastolic}
              </span>
              <span className="text-sm font-semibold text-slate-500 mb-1.5">mmHg</span>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white/70 backdrop-blur-md rounded-[2rem] border border-white/60 p-6 shadow-sm shrink-0">
        <h3 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-pink-500" />
          แนวโน้มย้อนหลัง 7 วัน
        </h3>
        
        {isLoading ? (
          <div className="h-[200px] flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="h-[220px] w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={logs} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <ReferenceLine y={140} stroke="#fca5a5" strokeDasharray="4 4" />
                <ReferenceLine y={90} stroke="#fca5a5" strokeDasharray="4 4" />
                <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }} domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.6)', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} labelStyle={{ fontWeight: 'bold', color: '#334155', marginBottom: '4px' }} itemStyle={{ fontWeight: 600, fontSize: '14px' }} />
                <Line type="monotone" dataKey="systolic" name="SYS" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
                <Line type="monotone" dataKey="diastolic" name="DIA" stroke="#f472b6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, fill: '#f472b6', stroke: '#fff', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        
        <div className="flex items-center justify-center gap-6 mt-6 text-xs font-semibold text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" /> ตัวบน (SYS)
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-pink-400 shadow-[0_0_8px_rgba(244,114,182,0.5)]" /> ตัวล่าง (DIA)
          </div>
        </div>
      </div>
      
      <div className="bg-orange-50/80 backdrop-blur-sm rounded-[1.5rem] p-5 border border-white/60 shadow-sm shrink-0">
        <p className="text-xs text-orange-800/90 leading-relaxed font-semibold">
          * ค่าความดันปกติควรต่ำกว่า 120/80 mmHg <br/>
          * หากค่าตัวใดตัวหนึ่งสูงกว่า <span className="font-bold text-red-600 bg-red-100/50 px-1 py-0.5 rounded-md">140/90 mmHg</span> ถือว่ามีความเสี่ยงครรภ์เป็นพิษ
        </p>
      </div>
    </>
  );

  const renderWeight = () => (
    <>
      <div className="p-6 rounded-[2rem] flex items-center justify-between shadow-sm relative overflow-hidden shrink-0 bg-gradient-to-br from-emerald-50/80 to-teal-50/80 border border-white/60">
        <div className="relative z-10 flex flex-col">
          <span className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-500" />
            น้ำหนักล่าสุด
          </span>
          <div className="flex items-end gap-1.5">
            <span className="text-4xl font-bold tracking-tight tabular-nums text-slate-800">-</span>
            <span className="text-sm font-semibold text-slate-500 mb-1.5">กก.</span>
          </div>
          <p className="text-xs font-medium text-emerald-600 mt-1">ยังไม่มีข้อมูล</p>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-md rounded-[2rem] border border-white/60 p-6 shadow-sm shrink-0">
        <h3 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          แนวโน้มน้ำหนัก
        </h3>
        <div className="h-[220px] w-full -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[]} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }} domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.6)', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
              <Line type="monotone" dataKey="weight" name="น้ำหนัก" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-emerald-50/80 backdrop-blur-sm rounded-[1.5rem] p-5 border border-white/60 shadow-sm shrink-0">
        <p className="text-xs text-emerald-800/90 leading-relaxed font-semibold">
          * น้ำหนักควรขึ้นประมาณ 1-2 กิโลกรัมต่อเดือนในไตรมาสที่ 2 และ 3
        </p>
      </div>
    </>
  );

  const renderKicks = () => (
    <>
      <div className="p-6 rounded-[2rem] flex items-center justify-between shadow-sm relative overflow-hidden shrink-0 bg-gradient-to-br from-purple-50/80 to-fuchsia-50/80 border border-white/60">
        <div className="relative z-10 flex flex-col">
          <span className="text-sm font-semibold text-slate-600 mb-2 flex items-center gap-2">
            <Baby className="w-4 h-4 text-purple-500" />
            ลูกดิ้นวันนี้
          </span>
          <div className="flex items-end gap-1.5">
            <span className="text-4xl font-bold tracking-tight tabular-nums text-slate-800">-</span>
            <span className="text-sm font-semibold text-slate-500 mb-1.5">ครั้ง</span>
          </div>
          <p className="text-xs font-medium text-purple-600 mt-1">ยังไม่มีข้อมูล</p>
        </div>
      </div>

      <div className="bg-white/70 backdrop-blur-md rounded-[2rem] border border-white/60 p-6 shadow-sm shrink-0">
        <h3 className="text-sm font-bold text-slate-700 mb-6 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-purple-500" />
          สถิติการดิ้นย้อนหลัง
        </h3>
        <div className="h-[220px] w-full -ml-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[]} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <ReferenceLine y={10} stroke="#fca5a5" strokeDasharray="4 4" />
              <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }} />
              <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.6)', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
              <Bar dataKey="count" name="จำนวนครั้ง" fill="#d946ef" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-orange-50/80 backdrop-blur-sm rounded-[1.5rem] p-5 border border-white/60 shadow-sm shrink-0">
        <p className="text-xs text-orange-800/90 leading-relaxed font-semibold">
          * ลูกควรดิ้นไม่ต่ำกว่า <span className="font-bold text-red-600">10 ครั้ง</span> ใน 2 ชั่วโมงหลังอาหาร
        </p>
      </div>
    </>
  );

  return (
    <div className="pt-8 pb-8 px-6 md:px-10 flex flex-col gap-4 max-w-3xl mx-auto w-full">
      <header>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">ประวัติสุขภาพ</h1>
        <p className="text-slate-500 mt-1">ติดตามข้อมูลสุขภาพของคุณแม่</p>
      </header>

      <div className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="flex items-center gap-2 w-max">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-slate-800 text-white shadow-md shadow-slate-800/20"
                  : "bg-white/60 border border-white/60 text-slate-500 hover:bg-white/90 shadow-sm"
              )}
            >
              <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-pink-400" : "text-slate-400")} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {activeTab === "bp" && renderBP()}
        {activeTab === "weight" && renderWeight()}
        {activeTab === "kicks" && renderKicks()}
      </div>
    </div>
  );
}
