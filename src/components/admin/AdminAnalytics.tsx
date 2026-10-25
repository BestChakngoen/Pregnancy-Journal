"use client";

import dynamic from "next/dynamic";
import { AlertOctagon, AlertTriangle, CheckCircle2 } from "lucide-react";
import { CHART_COLORS, type Analytics } from "@/lib/analytics";
import { ASSESSMENT_QUESTIONS, RISK_LABEL, SATISFACTION_QUESTIONS, type RiskLevel } from "@/lib/questions";
import { cn } from "@/lib/utils";

// ระหว่างโหลดไม่ต้องมี placeholder ของตัวเอง: ChartBox จองความสูงไว้แล้ว จึงไม่กระโดดตอนโหลด
const charts = () => import("@/components/charts/AdminCharts");
const ScoreHistogram = dynamic(() => charts().then((m) => m.ScoreHistogram), { ssr: false, loading: () => null });
const BPTrendChart = dynamic(() => charts().then((m) => m.BPTrendChart), { ssr: false, loading: () => null });

const fmt = (n: number | null) => (n === null ? "–" : n.toFixed(1));

export const RISK_STATUS: Record<RiskLevel, { color: string; Icon: typeof CheckCircle2 }> = {
  low: { color: CHART_COLORS.good, Icon: CheckCircle2 },
  medium: { color: CHART_COLORS.warning, Icon: AlertTriangle },
  high: { color: CHART_COLORS.critical, Icon: AlertOctagon },
};

function Tile({ label, value, caption, children, className }: { label: React.ReactNode; value: string; caption?: React.ReactNode; children?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col min-w-0", className)}>
      <span className="text-xs text-slate-500 flex items-center gap-1">{label}</span>
      <span className="text-2xl font-semibold text-slate-800 mt-1">{value}</span>
      {caption && <span className="text-xs text-slate-500 mt-0.5">{caption}</span>}
      {children}
    </div>
  );
}

function Card({ title, subtitle, children, className }: { title: string; subtitle?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3 min-w-0 break-inside-avoid", className)}>
      <div>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

// กราฟยืดเต็มความสูงที่การ์ดเหลือ (เมื่อการ์ดข้างเคียงในแถวสูงกว่า) แต่ไม่เตี้ยกว่า min และไม่สูงเกิน 360px
function ChartBox({ min, children }: { min: number; children: React.ReactNode }) {
  return (
    <div className="relative flex-1 w-full" style={{ minHeight: min, maxHeight: 360 }}>
      <div className="absolute inset-0">{children}</div>
    </div>
  );
}

// แถบแนวนอนบาง ปลายมน 4px ฝั่งค่า ตัวเลขแสดงเสมอ (ไม่ต้องพึ่ง hover)
function HBar({ label, value, max, display, color, icon }: { label: string; value: number; max: number; display: string; color: string; icon?: React.ReactNode }) {
  return (
    <li className="flex flex-col gap-1" title={`${label}: ${display}`}>
      <div className="flex items-baseline justify-between gap-3 text-xs">
        <span className="text-slate-600 flex items-start gap-1.5 min-w-0">
          {icon}
          <span className="line-clamp-2">{label}</span>
        </span>
        <span className="font-semibold text-slate-800 tabular-nums shrink-0">{display}</span>
      </div>
      <div className="h-2.5 w-full">
        <div className="h-full rounded-r-[4px]" style={{ width: `${max > 0 ? (value / max) * 100 : 0}%`, minWidth: value > 0 ? 4 : 0, background: color }} />
      </div>
    </li>
  );
}

export function Legend({ items }: { items: { label: string; color: string; shape: "rect" | "line" }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5">
          <span className={i.shape === "rect" ? "w-2.5 h-2.5 rounded-[2px]" : "w-3.5 h-0.5 rounded-full"} style={{ background: i.color }} />
          {i.label}
        </li>
      ))}
    </ul>
  );
}

export function TableView({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    // -my-2: ดึงปุ่มชิดกราฟ/ขอบการ์ด (พื้นที่กดยังสูง 44px ซ้อนทับเฉพาะขอบว่างของกราฟและ padding การ์ด)
    <details className="text-xs text-slate-600 print:hidden -my-2">
      <summary className="cursor-pointer select-none min-h-[44px] flex items-center">ดูเป็นตาราง</summary>
      <table className="w-full tabular-nums">
        <thead>
          <tr className="text-slate-500">
            {head.map((h) => <th key={h} className="text-left font-medium py-1">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r[0])} className="border-t border-slate-100">
              {r.map((c, i) => <td key={i} className="py-1">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}

const Empty = ({ children }: { children: React.ReactNode }) => <p className="text-xs text-slate-500 py-6 text-center">{children}</p>;

export default function AdminAnalytics({ a }: { a: Analytics }) {
  const gain = a.pairedGain;

  // ผัง 2 คอลัมน์: แถวบน = ผลการเรียนรู้ (คะแนน + ความพึงพอใจ), แถวกลาง = สุขภาพมารดา (ความเสี่ยง + ความดัน), แถวล่าง = การบันทึก
  // การ์ดในแถวเดียวกันสูงเท่ากัน และกราฟยืดเติมความสูงที่เหลือ (ChartBox) จึงไม่มีช่องว่างในการ์ดหรือข้างการ์ด
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* KPI: มือถือ = ผู้ป่วย|พึงพอใจ (ค่าสั้น) แถวเดียวกัน, คะแนนความรู้ (ข้อความยาว) เต็มแถวถัดมา */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:col-span-2">
        <Tile label="ผู้ป่วยทั้งหมด" value={String(a.patientCount)} caption="กรอกข้อมูลส่วนตัวแล้ว" />
        <Tile className="col-span-2 order-last md:col-span-1 md:order-none" label="คะแนนความรู้เฉลี่ย" value={`${fmt(a.preAvg)} → ${fmt(a.postAvg)}`} caption={`ก่อน → หลังเรียน (เต็ม ${a.scoreTotal})`}>
          {gain !== null && (
            <span className="text-xs font-semibold mt-1" style={{ color: gain >= 0 ? CHART_COLORS.gainText : CHART_COLORS.critical }}>
              {gain >= 0 ? "+" : ""}{gain.toFixed(1)} คะแนน · {a.pairedCount} คนที่ทำครบ
            </span>
          )}
        </Tile>
        <Tile label="ความพึงพอใจเฉลี่ย" value={`${fmt(a.satisfactionAvg)} / 5`} caption={`ตอบแล้ว ${a.satisfactionRespondents} คน`} />
      </div>

      <Card title="คะแนนความรู้ก่อน–หลังเรียน" subtitle={`จำนวนคนในแต่ละคะแนน (เต็ม ${a.scoreTotal})`}>
        {a.preCount + a.postCount === 0 ? (
          <Empty>ยังไม่มีผู้ทำแบบทดสอบ</Empty>
        ) : (
          <>
            <Legend items={[
              { label: `ก่อนเรียน (${a.preCount} คน)`, color: CHART_COLORS.pre, shape: "rect" },
              { label: `หลังเรียน (${a.postCount} คน)`, color: CHART_COLORS.post, shape: "rect" },
            ]} />
            <ChartBox min={200}><ScoreHistogram data={a.scoreHistogram} /></ChartBox>
            <TableView head={["คะแนน", "ก่อนเรียน (คน)", "หลังเรียน (คน)"]} rows={a.scoreHistogram.map((r) => [r.score, r.pre, r.post])} />
          </>
        )}
      </Card>

      <Card title="ความพึงพอใจรายข้อ" subtitle={`คะแนนเฉลี่ย (เต็ม 5) · ตอบแล้ว ${a.satisfactionRespondents} คน`}>
        {a.satisfactionRespondents === 0 ? (
          <Empty>ยังไม่มีผู้ตอบแบบประเมินความพึงพอใจ</Empty>
        ) : (
          <ul className="flex flex-col gap-3">
            {SATISFACTION_QUESTIONS.map((q) => {
              const s = a.satisfactionByQuestion.get(q.id);
              return <HBar key={q.id} label={`${q.id}. ${q.text}`} value={s?.avg ?? 0} max={5} color={CHART_COLORS.post} display={s ? s.avg.toFixed(1) : "–"} />;
            })}
          </ul>
        )}
      </Card>

      <Card title="ผลประเมินความเสี่ยง" subtitle={`ผลล่าสุดของแต่ละคน · ประเมินแล้ว ${a.assessedCount} จาก ${a.patientCount} คน`}>
        {a.assessedCount === 0 ? (
          <Empty>ยังไม่มีผู้ทำแบบประเมินความเสี่ยง</Empty>
        ) : (
          <>
            <ul className="flex flex-col gap-3">
              {(["high", "medium", "low"] as const).map((level) => {
                const { color, Icon } = RISK_STATUS[level];
                const n = a.riskLevels[level];
                return (
                  <HBar key={level} label={RISK_LABEL[level]} value={n} max={a.assessedCount} color={color}
                    display={`${n} คน (${Math.round((n / a.assessedCount) * 100)}%)`}
                    icon={<Icon className="w-3.5 h-3.5 shrink-0 mt-px" style={{ color }} aria-hidden="true" />} />
                );
              })}
            </ul>
            <h4 className="text-xs font-semibold text-slate-600 mt-2">ปัจจัยเสี่ยงที่พบ (จากผู้ที่ประเมินแล้ว)</h4>
            <ul className="flex flex-col gap-3">
              {ASSESSMENT_QUESTIONS.map((q) => {
                const n = a.factorCounts.get(q.id) ?? 0;
                return <HBar key={q.id} label={q.title} value={n} max={a.assessedCount} color={CHART_COLORS.post} display={`${n} คน (${Math.round((n / a.assessedCount) * 100)}%)`} />;
              })}
            </ul>
          </>
        )}
      </Card>

      <Card title={`ความดันโลหิตเฉลี่ยรายวัน (${a.bpDays} วันล่าสุด)`}
        subtitle={`วัด ${a.recentReadings} ครั้ง · ถึงเกณฑ์ความดันสูง (≥140/90) ${a.recentHighReadings} ครั้ง`}>
        {a.bpDaily.length === 0 ? (
          <Empty>ยังไม่มีการบันทึกความดันในช่วงนี้</Empty>
        ) : (
          <>
            <Legend items={[
              { label: "ตัวบน (SYS)", color: CHART_COLORS.systolic, shape: "line" },
              { label: "ตัวล่าง (DIA)", color: CHART_COLORS.diastolic, shape: "line" },
            ]} />
            <ChartBox min={220}><BPTrendChart data={a.bpDaily} /></ChartBox>
            <TableView head={["วันที่", "SYS เฉลี่ย", "DIA เฉลี่ย", "จำนวนครั้ง"]} rows={a.bpDaily.map((d) => [d.label, d.systolic, d.diastolic, d.count])} />
          </>
        )}
      </Card>

      {/* แถบเต็มความกว้าง: 3 รายการเรียงเป็น 3 คอลัมน์บนจอกว้าง แทนการกองซ้อนในการ์ดครึ่งจอที่มีช่องว่างเหลือ */}
      <Card className="md:col-span-2" title={`การบันทึกสุขภาพ (${a.bpDays} วันล่าสุด)`} subtitle={`จำนวนผู้ป่วยที่บันทึก จากทั้งหมด ${a.patientCount} คน`}>
        <ul className="flex flex-col gap-3 md:grid md:grid-cols-3 md:gap-6">
          {([
            ["ความดันโลหิต", a.recording.bp, "ครั้ง"],
            ["น้ำหนัก", a.recording.weight, "ครั้ง"],
            ["นับลูกดิ้น", a.recording.kicks, "วัน"],
          ] as const).map(([label, r, unit]) => (
            <HBar key={label} label={label} value={r.patients} max={a.patientCount} color={CHART_COLORS.post}
              display={`${r.patients} คน · ${r.records} ${unit}`} />
          ))}
        </ul>
      </Card>
    </div>
  );
}
