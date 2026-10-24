"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ChevronDown } from "lucide-react";
import { CHART_COLORS, type BPLogDoc, type HealthData, type KickDayDoc, type PatientDoc, type WeightLogDoc } from "@/lib/analytics";
import { ASSESSMENT_QUESTIONS, RISK_LABEL } from "@/lib/questions";
import { RISK_STATUS } from "@/components/admin/AdminAnalytics";
import { cn } from "@/lib/utils";

// ใช้กราฟเดียวกับหน้าประวัติสุขภาพของคุณแม่
const charts = () => import("@/components/charts/HistoryCharts");
// next/dynamic ต้องเขียน options ตรงๆ (ใช้ตัวแปรไม่ได้)
const BPChart = dynamic(() => charts().then((m) => m.BPChart), { ssr: false, loading: () => <div className="h-full" /> });
const WeightChart = dynamic(() => charts().then((m) => m.WeightChart), { ssr: false, loading: () => <div className="h-full" /> });
const KicksChart = dynamic(() => charts().then((m) => m.KicksChart), { ssr: false, loading: () => <div className="h-full" /> });

const shortDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

function Detail({ title, empty, children }: { title: string; empty: boolean; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-semibold text-slate-700 mb-2">{title}</p>
      {empty ? <p className="text-slate-400">ยังไม่มีการบันทึก</p> : <div className="h-[200px] w-full -ml-4">{children}</div>}
    </div>
  );
}

const Chip = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg text-xs text-slate-700 tabular-nums">{children}</span>
);

function PatientCard({ p, logs, weights, kicks }: { p: PatientDoc; logs: BPLogDoc[]; weights: WeightLogDoc[]; kicks: KickDayDoc[] }) {
  const [open, setOpen] = useState(false);
  const latest = logs[logs.length - 1];
  const latestWeight = weights[weights.length - 1];
  const risk = p.assessment && RISK_STATUS[p.assessment.level];
  const satisfaction = Object.values(p.satisfaction ?? {});

  return (
    <li className="bg-white rounded-2xl shadow-sm border border-slate-100 break-inside-avoid">
      <button onClick={() => setOpen(!open)} aria-expanded={open} className="w-full p-4 flex flex-col gap-2 text-left">
        <div className="w-full flex justify-between items-start gap-2">
          <div className="min-w-0">
            <h3 className="font-bold text-slate-800 text-lg truncate">แม่{p.name}</h3>
            <p className="text-xs text-slate-500">อายุ {p.age} ปี • ครรภ์ที่ {p.gravida}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs font-bold rounded-lg">{p.gestationalWeeks} Wk</span>
            <ChevronDown className={cn("w-5 h-5 text-slate-400 transition-transform print:hidden", open && "rotate-180")} aria-hidden="true" />
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <Chip>ก่อนเรียน {p.preTest ? `${p.preTest.score}/${p.preTest.total}` : "–"}</Chip>
          <Chip>หลังเรียน {p.postTest ? `${p.postTest.score}/${p.postTest.total}` : "–"}</Chip>
          <Chip>
            {risk ? (
              <>
                <risk.Icon className="w-3.5 h-3.5" style={{ color: risk.color }} aria-hidden="true" />
                {RISK_LABEL[p.assessment!.level]}
              </>
            ) : "ยังไม่ประเมินความเสี่ยง"}
          </Chip>
          {latest && (
            <Chip>
              {latest.isHighRisk && <span className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS.critical }} aria-hidden="true" />}
              ความดันล่าสุด {latest.systolic}/{latest.diastolic}
              {latest.isHighRisk && <span className="sr-only">(สูงกว่าเกณฑ์)</span>}
            </Chip>
          )}
          {latestWeight && <Chip>น้ำหนักล่าสุด {latestWeight.kg} กก.</Chip>}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 flex flex-col gap-3 border-t border-slate-100 pt-3 text-xs text-slate-600">
          {p.assessment && p.assessment.factors.length > 0 && (
            <p>
              <span className="font-semibold text-slate-700">ปัจจัยเสี่ยง: </span>
              {ASSESSMENT_QUESTIONS.filter((q) => p.assessment!.factors.includes(q.id)).map((q) => q.title).join(", ")}
            </p>
          )}
          {satisfaction.length > 0 && (
            <p>
              <span className="font-semibold text-slate-700">ความพึงพอใจเฉลี่ย: </span>
              {(satisfaction.reduce((a, b) => a + b, 0) / satisfaction.length).toFixed(1)} / 5
            </p>
          )}
          <Detail title={`ความดันโลหิต (${logs.length} ครั้ง${logs.length > 30 ? " · แสดง 30 ครั้งล่าสุด" : ""})`} empty={logs.length === 0}>
            <BPChart data={logs.slice(-30).map((l) => ({ ...l, displayDate: shortDate(l.timestamp) }))} />
          </Detail>
          <Detail title={`น้ำหนัก (${weights.length} ครั้ง${weights.length > 30 ? " · แสดง 30 ครั้งล่าสุด" : ""})`} empty={weights.length === 0}>
            <WeightChart data={weights.slice(-30).map((w) => ({ date: shortDate(w.timestamp), kg: w.kg }))} />
          </Detail>
          <Detail title="ลูกดิ้นต่อวัน (14 วันล่าสุดที่บันทึก)" empty={kicks.length === 0}>
            <KicksChart data={kicks.slice(-14).map((k) => ({ date: shortDate(`${k.date}T00:00:00`), count: k.count }))} />
          </Detail>
        </div>
      )}
    </li>
  );
}

// แยกบันทึกตามคน เรียงเก่า → ใหม่ (ISO timestamp / YYYY-MM-DD เทียบแบบ string ได้)
function groupByPatient<T extends { uid: string }>(xs: T[], key: (x: T) => string) {
  const byPatient = new Map<string, T[]>();
  for (const x of [...xs].sort((a, b) => key(a).localeCompare(key(b)))) {
    byPatient.set(x.uid, [...(byPatient.get(x.uid) ?? []), x]);
  }
  return byPatient;
}

export default function PatientList({ data }: { data: HealthData }) {
  const bp = groupByPatient(data.bp, (l) => l.timestamp);
  const weights = groupByPatient(data.weights, (w) => w.timestamp);
  const kicks = groupByPatient(data.kicks, (k) => k.date);

  if (data.patients.length === 0) return <p className="text-center text-slate-500 py-8 text-sm">ยังไม่มีข้อมูลผู้ป่วย</p>;
  return (
    <ul className="flex flex-col gap-3">
      {data.patients.map((p) => (
        <PatientCard key={p.id} p={p} logs={bp.get(p.id) ?? []} weights={weights.get(p.id) ?? []} kicks={kicks.get(p.id) ?? []} />
      ))}
    </ul>
  );
}
