"use client";

import { useId, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { AlertOctagon, CheckCircle2, ChevronDown, Clock, CircleDashed, Search, Trash2 } from "lucide-react";
import { CHART_COLORS, INACTIVE_DAYS, baselinePre, buildPatientRows, daysAgo, type HealthData, type PatientDoc, type PatientRow, type ScoreResult } from "@/lib/analytics";
import { ASSESSMENT_QUESTIONS, RISK_LABEL } from "@/lib/questions";
import { Legend, TableView } from "@/components/admin/AdminAnalytics";
import DeletePatientDialog from "@/components/admin/DeletePatientDialog";
import { cn } from "@/lib/utils";

// กราฟชุดเดียวกับภาพรวม (โหลดแยกผ่าน next/dynamic) — กล่องสูงคงที่ จึงไม่กระโดดตอนโหลด
const charts = () => import("@/components/charts/AdminCharts");
const PatientBPChart = dynamic(() => charts().then((m) => m.PatientBPChart), { ssr: false, loading: () => <div className="h-[200px]" /> });
const PatientWeightChart = dynamic(() => charts().then((m) => m.PatientWeightChart), { ssr: false, loading: () => <div className="h-[180px]" /> });
const PatientKicksChart = dynamic(() => charts().then((m) => m.PatientKicksChart), { ssr: false, loading: () => <div className="h-[180px]" /> });

const shortDate = (t: string) => {
  const d = new Date(t);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

const scoreText = (r: ScoreResult) => `${r.score}/${r.total}`;
const avgScore = (m: Record<string, number>) => {
  const v = Object.values(m);
  return v.length ? v.reduce((a, b) => a + b, 0) / v.length : null;
};

// ชุดที่ทำซ้ำ (ครั้งแรกต่างจากครั้งล่าสุด): แสดง "ครั้งแรก → ล่าสุด" ให้เห็นพัฒนาการ — ไม่ได้ทำซ้ำหรือยังไม่มีครั้งแรก = ไม่แสดง
function retakes(p: PatientDoc): string[] {
  const out: string[] = [];
  if (p.preTestFirst && p.preTest && p.preTestFirst.at !== p.preTest.at) out.push(`Pre-test ${scoreText(p.preTestFirst)} → ${scoreText(p.preTest)}`);
  if (p.postTestFirst && p.postTest && p.postTestFirst.at !== p.postTest.at) out.push(`Post-test ${scoreText(p.postTestFirst)} → ${scoreText(p.postTest)}`);
  if (p.assessmentFirst && p.assessment && p.assessmentFirst.at !== p.assessment.at) {
    out.push(`ประเมินความเสี่ยง ${RISK_LABEL[p.assessmentFirst.level]} → ${RISK_LABEL[p.assessment.level]}`);
  }
  if (p.satisfactionFirst && p.satisfaction && JSON.stringify(p.satisfactionFirst) !== JSON.stringify(p.satisfaction)) {
    const [first, latest] = [avgScore(p.satisfactionFirst), avgScore(p.satisfaction)];
    if (first !== null && latest !== null) out.push(`ความพึงพอใจ ${first.toFixed(1)} → ${latest.toFixed(1)}`);
  }
  return out;
}

const agoText = (days: number) => (days <= 0 ? "วันนี้" : days === 1 ? "เมื่อวาน" : `${days} วันก่อน`);

type FilterId = "all" | "followUp" | "high" | "inactive" | "notAssessed";
const FILTERS: { id: FilterId; label: string; match: (r: PatientRow) => boolean }[] = [
  { id: "all", label: "ทั้งหมด", match: () => true },
  { id: "followUp", label: "ต้องติดตาม", match: (r) => r.severity > 0 },
  { id: "high", label: "เสี่ยงสูง", match: (r) => r.bpHigh || r.riskHigh },
  { id: "inactive", label: `ไม่บันทึก ${INACTIVE_DAYS} วันขึ้นไป`, match: (r) => r.inactive },
  { id: "notAssessed", label: "ยังไม่ประเมิน", match: (r) => !r.p.assessment },
];

// ชิปสถานะ: ข้อความ + ไอคอนเสมอ สีเป็นแค่ตัวช่วย (พิมพ์ขาวดำก็ยังอ่านออก)
const TONES = {
  critical: "bg-red-50 text-red-800",
  warning: "bg-amber-50 text-amber-900",
  neutral: "bg-slate-100 text-slate-700",
  good: "bg-emerald-50 text-emerald-800",
};

function StatusChip({ tone, icon: Icon, children }: { tone: keyof typeof TONES; icon: typeof Clock; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold tabular-nums", TONES[tone])}>
      <Icon className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
      {children}
    </span>
  );
}

function Detail({ title, empty, children }: { title: string; empty: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-semibold text-slate-700">{title}</p>
      {empty ? <p className="text-slate-500">ยังไม่มีการบันทึก</p> : children}
    </div>
  );
}

type DeleteHandler = (uid: string) => Promise<void>;

function PatientItem({ r, now, onDelete }: { r: PatientRow; now: Date; onDelete?: DeleteHandler }) {
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const panelId = useId();
  const { p, latestBP } = r;
  const latestWeight = r.weights[r.weights.length - 1];
  const satisfaction = Object.values(p.satisfaction ?? {});
  const pre = baselinePre(p); // ก่อนเรียน = Pre-test ครั้งแรก
  const retake = retakes(p);
  const bpAgo = latestBP && agoText(daysAgo(latestBP.timestamp, now));

  // ข้อมูลประกอบ (ไม่ใช่สัญญาณเตือน) — ค่าที่เป็นสัญญาณเตือนอยู่ในชิปด้านบนแล้ว จึงไม่ซ้ำ
  const facts = [
    latestBP && !r.bpHigh && `ความดันล่าสุด ${latestBP.systolic}/${latestBP.diastolic} (${bpAgo})`,
    p.assessment && !r.riskHigh && `ผลประเมิน: ${RISK_LABEL[p.assessment.level]}`,
    latestWeight && `น้ำหนัก ${latestWeight.kg} กก.`,
    pre && `ความรู้ ${pre.score}${p.postTest ? ` → ${p.postTest.score}` : ""}/${pre.total}`,
  ].filter(Boolean);

  return (
    <li className="py-4 break-inside-avoid">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900 break-words">แม่{p.name}</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            อายุ {p.age} ปี · ครรภ์ที่ {p.gravida} · อายุครรภ์ {p.gestationalWeeks} สัปดาห์ (ตามที่กรอก)
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls={panelId}
          className="shrink-0 -mr-2 min-h-[44px] px-3 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 flex items-center gap-1 print:hidden"
        >
          {open ? "ซ่อน" : "รายละเอียด"}
          <ChevronDown className={cn("w-4 h-4 transition-transform", open && "rotate-180")} aria-hidden="true" />
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {r.bpHigh && latestBP && (
          <StatusChip tone="critical" icon={AlertOctagon}>
            ความดันสูง {latestBP.systolic}/{latestBP.diastolic} · {bpAgo}
          </StatusChip>
        )}
        {r.riskHigh && <StatusChip tone="critical" icon={AlertOctagon}>ผลประเมินเสี่ยงสูง</StatusChip>}
        {r.inactive && (
          <StatusChip tone="warning" icon={Clock}>
            {r.everLogged ? `ไม่บันทึกมา ${r.daysSinceLog} วัน` : `ยังไม่เคยบันทึกสุขภาพ (สมัคร ${r.daysSinceLog} วันก่อน)`}
          </StatusChip>
        )}
        {!p.assessment && <StatusChip tone="neutral" icon={CircleDashed}>ยังไม่ประเมินความเสี่ยง</StatusChip>}
        {r.severity === 0 && <StatusChip tone="good" icon={CheckCircle2}>ไม่มีสัญญาณที่ต้องติดตาม</StatusChip>}
      </div>

      {facts.length > 0 && <p className="mt-2 text-xs text-slate-600 tabular-nums">{facts.join(" · ")}</p>}

      {open && (
        <div id={panelId} className="mt-3 pt-3 border-t border-slate-100 flex flex-col gap-4 text-xs text-slate-600">
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
          {retake.length > 0 && (
            <p>
              <span className="font-semibold text-slate-700">ทำซ้ำ (ครั้งแรก → ล่าสุด): </span>
              {retake.join(" · ")}
            </p>
          )}

          <div className="grid gap-5 md:grid-cols-3">
            <Detail title={`ความดันโลหิต (${r.bp.length} ครั้ง${r.bp.length > 30 ? " · 30 ครั้งล่าสุด" : ""})`} empty={r.bp.length === 0}>
              <Legend items={[
                { label: "ตัวบน (SYS)", color: CHART_COLORS.systolic, shape: "line" },
                { label: "ตัวล่าง (DIA)", color: CHART_COLORS.diastolic, shape: "line" },
              ]} />
              <PatientBPChart data={r.bp.slice(-30).map((l) => ({ label: shortDate(l.timestamp), systolic: l.systolic, diastolic: l.diastolic }))} />
              <TableView head={["วันที่", "SYS", "DIA"]} rows={r.bp.slice(-30).reverse().map((l) => [shortDate(l.timestamp), l.systolic, l.diastolic])} />
            </Detail>
            <Detail title={`น้ำหนัก (${r.weights.length} ครั้ง${r.weights.length > 30 ? " · 30 ครั้งล่าสุด" : ""})`} empty={r.weights.length === 0}>
              <PatientWeightChart data={r.weights.slice(-30).map((w) => ({ label: shortDate(w.timestamp), kg: w.kg }))} />
              <TableView head={["วันที่", "กก."]} rows={r.weights.slice(-30).reverse().map((w) => [shortDate(w.timestamp), w.kg])} />
            </Detail>
            <Detail title="ลูกดิ้นต่อวัน (14 วันล่าสุดที่บันทึก · เส้นประ = 10 ครั้ง)" empty={r.kicks.length === 0}>
              <PatientKicksChart data={r.kicks.slice(-14).map((k) => ({ label: shortDate(`${k.date}T00:00:00`), count: k.count }))} />
              <TableView head={["วันที่", "ครั้ง"]} rows={r.kicks.slice(-14).reverse().map((k) => [shortDate(`${k.date}T00:00:00`), k.count])} />
            </Detail>
          </div>

          {onDelete && (
            <button
              type="button"
              onClick={() => setDeleting(true)}
              className="self-start min-h-[44px] px-4 rounded-xl text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 flex items-center gap-2 print:hidden"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              ลบบัญชีผู้ใช้
            </button>
          )}
        </div>
      )}

      {deleting && onDelete && (
        <DeletePatientDialog name={p.name?.trim() || p.id} onConfirm={() => onDelete(p.id)} onClose={() => setDeleting(false)} />
      )}
    </li>
  );
}

function Group({ title, rows, now, onDelete }: { title?: string; rows: PatientRow[]; now: Date; onDelete?: DeleteHandler }) {
  if (rows.length === 0) return null;
  return (
    <section className="bg-white rounded-2xl border border-slate-200/70 px-4 md:px-5">
      {title && <h2 className="pt-4 text-sm font-semibold text-slate-700">{title} <span className="text-slate-500 font-normal tabular-nums">· {rows.length} คน</span></h2>}
      <ul className="divide-y divide-slate-100">
        {rows.map((r) => <PatientItem key={r.p.id} r={r} now={now} onDelete={onDelete} />)}
      </ul>
    </section>
  );
}

// onDelete ไม่ส่งมา = ไม่แสดงปุ่มลบ (โหมดตัวอย่าง)
export default function PatientList({ data, now, onDelete }: { data: HealthData; now: Date; onDelete?: DeleteHandler }) {
  const rows = useMemo(() => buildPatientRows(data, now), [data, now]);
  const [filter, setFilter] = useState<FilterId>("all");
  const [query, setQuery] = useState("");

  if (rows.length === 0) return <p className="text-center text-slate-500 py-8 text-sm">ยังไม่มีผู้ป่วยในระบบ</p>;

  const q = query.trim().toLowerCase();
  const active = FILTERS.find((f) => f.id === filter)!;
  const shown = rows.filter((r) => active.match(r) && (!q || (r.p.name ?? "").toLowerCase().includes(q)));
  const needs = shown.filter((r) => r.severity > 0);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 print:hidden">
        <label className="relative">
          <span className="sr-only">ค้นหาชื่อคุณแม่</span>
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ค้นหาชื่อคุณแม่"
            className="w-full md:max-w-sm min-h-[44px] pl-9 pr-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-800"
          />
        </label>
        <div role="group" aria-label="กรองรายชื่อ" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => {
            const n = rows.filter(f.match).length;
            return (
              <button
                key={f.id}
                type="button"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "min-h-[40px] px-3 rounded-full text-sm font-semibold border transition-colors tabular-nums",
                  filter === f.id ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-700 border-slate-200 hover:border-slate-400"
                )}
              >
                {f.label} <span className={filter === f.id ? "text-white/80" : "text-slate-500"}>{n}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* หัวข้อเฉพาะตอนพิมพ์: บอกว่ารายการนี้กรองอะไรไว้ */}
      <p className="hidden print:block text-sm text-slate-700">
        รายชื่อ: {active.label}{q && ` · ค้นหา "${query.trim()}"`} · {shown.length} คน
      </p>

      {shown.length === 0 ? (
        <p className="text-center text-slate-500 py-8 text-sm">ไม่พบคุณแม่ที่ตรงกับเงื่อนไขนี้</p>
      ) : filter === "all" ? (
        <>
          <Group title="ต้องติดตาม" rows={needs} now={now} onDelete={onDelete} />
          <Group title="ไม่มีสัญญาณที่ต้องติดตาม" rows={shown.filter((r) => r.severity === 0)} now={now} onDelete={onDelete} />
        </>
      ) : (
        <Group rows={shown} now={now} onDelete={onDelete} />
      )}
    </div>
  );
}
