// สรุปข้อมูลผู้ป่วยสำหรับหน้า admin — ฟังก์ชันล้วน (ไม่มี Firebase/React) จึงทดสอบด้วย node ได้
import type { RiskLevel } from "@/lib/questions";

export interface ScoreResult {
  score: number;
  total: number;
  at: string;
}

export interface PatientDoc {
  id: string;
  name?: string;
  age?: string;
  gestationalWeeks?: string;
  gravida?: string;
  createdAt?: string;
  satisfaction?: Record<string, number>;
  preTest?: ScoreResult;
  postTest?: ScoreResult;
  assessment?: { totalRisk: number; level: RiskLevel; factors: number[]; at: string };
}

export interface BPLogDoc {
  uid: string;
  systolic: number;
  diastolic: number;
  timestamp: string; // ISO
  isHighRisk: boolean;
}

export interface WeightLogDoc {
  uid: string;
  kg: number;
  timestamp: string; // ISO
}

export interface KickDayDoc {
  uid: string;
  date: string; // YYYY-MM-DD
  count: number;
}

export interface HealthData {
  patients: PatientDoc[];
  bp: BPLogDoc[];
  weights: WeightLogDoc[];
  kicks: KickDayDoc[];
}

export interface DailyBP {
  date: string; // YYYY-MM-DD (เวลาเครื่อง)
  label: string; // d/m สำหรับแกน X
  systolic: number;
  diastolic: number;
  count: number;
}

// สีกราฟ/แถบ (ไม่ได้อยู่ในไฟล์กราฟ เพื่อไม่ให้ดึง recharts มาทั้งก้อน) — ผ่าน validate_palette.js ของ dataviz แล้ว (พื้นการ์ดขาว)
export const CHART_COLORS = {
  pre: "#86b6ef", // ก่อน → หลัง: สีเดียว 2 ระดับ
  post: "#2a78d6",
  systolic: "#2a78d6",
  diastolic: "#eb6834",
  // สถานะ: ใช้คู่กับไอคอน + ข้อความเสมอ
  good: "#0ca30c",
  warning: "#fab219",
  critical: "#d03b3b",
  gainText: "#006300",
};

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null);
const pad = (n: number) => String(n).padStart(2, "0");

// ค่าล่าสุดของแต่ละคน (timestamp เป็น ISO จึงเทียบแบบ string ได้)
export function latestBPByPatient(logs: BPLogDoc[]) {
  const latest = new Map<string, BPLogDoc>();
  for (const log of logs) {
    const prev = latest.get(log.uid);
    if (!prev || log.timestamp > prev.timestamp) latest.set(log.uid, log);
  }
  return latest;
}

// เสี่ยงสูง = ผลประเมินล่าสุดเป็น "สูง" หรือความดันครั้งล่าสุดถึงเกณฑ์ (≥140/90 ตาม BloodPressureLogger)
export const isHighRiskPatient = (p: PatientDoc, latestBP?: BPLogDoc) =>
  p.assessment?.level === "high" || latestBP?.isHighRisk === true;

const DAY = 86_400_000;
export const INACTIVE_DAYS = 7;

// จำนวนวันตามปฏิทิน (เวลาเครื่อง) จาก t ถึง now: 0 = วันนี้, 1 = เมื่อวาน
export const daysAgo = (t: Date | string, now = new Date()) => {
  const start = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((start(now) - start(new Date(t))) / DAY);
};

// แยกบันทึกตามคน เรียงเก่า → ใหม่ (ISO timestamp / YYYY-MM-DD เทียบแบบ string ได้)
function groupByPatient<T extends { uid: string }>(xs: T[], key: (x: T) => string) {
  const byPatient = new Map<string, T[]>();
  for (const x of [...xs].sort((a, b) => key(a).localeCompare(key(b)))) {
    byPatient.set(x.uid, [...(byPatient.get(x.uid) ?? []), x]);
  }
  return byPatient;
}

export interface PatientRow {
  p: PatientDoc;
  bp: BPLogDoc[]; // เรียงเก่า → ใหม่
  weights: WeightLogDoc[];
  kicks: KickDayDoc[];
  latestBP?: BPLogDoc;
  bpHigh: boolean;
  riskHigh: boolean;
  everLogged: boolean;
  daysSinceLog: number | null; // นับจากบันทึกล่าสุด หรือวันสมัครถ้ายังไม่เคยบันทึก
  inactive: boolean;
  severity: number; // 0 = ไม่มีสัญญาณที่ต้องติดตาม
}

// รายชื่อสำหรับคัดกรอง: ความดันล่าสุดสูง > ประเมินเสี่ยงสูง > ไม่บันทึกนาน แล้วเรียงตามความดันที่วัดล่าสุด
export function buildPatientRows({ patients, bp, weights, kicks }: HealthData, now = new Date()): PatientRow[] {
  const bpBy = groupByPatient(bp, (l) => l.timestamp);
  const weightBy = groupByPatient(weights, (w) => w.timestamp);
  const kickBy = groupByPatient(kicks.filter((k) => k.count > 0), (k) => k.date);

  return patients
    .map((p) => {
      const b = bpBy.get(p.id) ?? [];
      const w = weightBy.get(p.id) ?? [];
      const k = kickBy.get(p.id) ?? [];
      const latestBP = b[b.length - 1];
      const logTimes = [latestBP?.timestamp, w[w.length - 1]?.timestamp, k[k.length - 1] && `${k[k.length - 1].date}T00:00:00`]
        .filter((t): t is string => !!t)
        .map((t) => new Date(t).getTime());
      const last = logTimes.length ? new Date(Math.max(...logTimes)) : p.createdAt;
      const daysSinceLog = last ? daysAgo(last, now) : null;
      const bpHigh = latestBP?.isHighRisk === true;
      const riskHigh = p.assessment?.level === "high";
      const inactive = daysSinceLog !== null && daysSinceLog >= INACTIVE_DAYS;
      const severity = (bpHigh ? 4 : 0) + (riskHigh ? 2 : 0) + (inactive ? 1 : 0);
      return { p, bp: b, weights: w, kicks: k, latestBP, bpHigh, riskHigh, everLogged: logTimes.length > 0, daysSinceLog, inactive, severity };
    })
    .sort((a, b) => b.severity - a.severity || (b.latestBP?.timestamp ?? "").localeCompare(a.latestBP?.timestamp ?? ""));
}

export function buildAnalytics({ patients, bp: logs, weights, kicks }: HealthData, now = new Date(), days = 30) {
  const latest = latestBPByPatient(logs);

  // แบบทดสอบ: เฉลี่ยทั้งหมด + ส่วนต่างเฉพาะคนที่ทำครบทั้งก่อนและหลัง (เทียบคนเดียวกัน)
  const pre = patients.flatMap((p) => (p.preTest ? [p.preTest.score] : []));
  const post = patients.flatMap((p) => (p.postTest ? [p.postTest.score] : []));
  const paired = patients.filter((p) => p.preTest && p.postTest);
  const scoreTotal = Math.max(10, ...patients.flatMap((p) => [p.preTest?.total ?? 0, p.postTest?.total ?? 0]));
  const scoreHistogram = Array.from({ length: scoreTotal + 1 }, (_, score) => ({
    score,
    pre: pre.filter((s) => s === score).length,
    post: post.filter((s) => s === score).length,
  }));

  // ประเมินความเสี่ยง
  const riskLevels: Record<RiskLevel, number> = { low: 0, medium: 0, high: 0 };
  const factorCounts = new Map<number, number>();
  for (const p of patients) {
    if (!p.assessment) continue;
    riskLevels[p.assessment.level]++;
    for (const f of p.assessment.factors) factorCounts.set(f, (factorCounts.get(f) ?? 0) + 1);
  }

  // ความพึงพอใจ: key ใน Firestore เป็น string ("1".."8")
  const byQuestion = new Map<number, number[]>();
  for (const p of patients) {
    for (const [id, score] of Object.entries(p.satisfaction ?? {})) {
      byQuestion.set(Number(id), [...(byQuestion.get(Number(id)) ?? []), score]);
    }
  }
  const allSatisfaction = [...byQuestion.values()].flat();

  // แนวโน้มความดัน: เฉลี่ยรายวันในช่วง days วันล่าสุด
  const cutoff = new Date(now);
  cutoff.setHours(0, 0, 0, 0);
  cutoff.setDate(cutoff.getDate() - (days - 1));
  const inWindow = (iso: string) => new Date(iso) >= cutoff && new Date(iso) <= now;
  const recent = logs.filter((l) => inWindow(l.timestamp));
  const recentWeights = weights.filter((w) => inWindow(w.timestamp));
  // วันที่ลูกดิ้น (YYYY-MM-DD) เทียบเป็นเวลาเที่ยงคืนของวันนั้นตามเวลาเครื่อง
  const recentKickDays = kicks.filter((k) => k.count > 0 && inWindow(new Date(`${k.date}T00:00:00`).toISOString()));
  const people = (xs: { uid: string }[]) => new Set(xs.map((x) => x.uid)).size;
  const byDay = new Map<string, BPLogDoc[]>();
  for (const l of recent) {
    const d = new Date(l.timestamp);
    const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    byDay.set(key, [...(byDay.get(key) ?? []), l]);
  }
  const bpDaily: DailyBP[] = [...byDay.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, ls]) => ({
      date,
      label: `${Number(date.slice(8))}/${Number(date.slice(5, 7))}`,
      systolic: Math.round(avg(ls.map((l) => l.systolic))!),
      diastolic: Math.round(avg(ls.map((l) => l.diastolic))!),
      count: ls.length,
    }));

  return {
    patientCount: patients.length,
    highRiskCount: patients.filter((p) => isHighRiskPatient(p, latest.get(p.id))).length,
    preAvg: avg(pre),
    postAvg: avg(post),
    preCount: pre.length,
    postCount: post.length,
    pairedCount: paired.length,
    pairedGain: avg(paired.map((p) => p.postTest!.score - p.preTest!.score)),
    scoreTotal,
    scoreHistogram,
    assessedCount: riskLevels.low + riskLevels.medium + riskLevels.high,
    riskLevels,
    factorCounts,
    satisfactionAvg: avg(allSatisfaction),
    satisfactionRespondents: patients.filter((p) => Object.keys(p.satisfaction ?? {}).length > 0).length,
    satisfactionByQuestion: new Map([...byQuestion].map(([id, xs]) => [id, { avg: avg(xs)!, n: xs.length }])),
    bpDaily,
    bpDays: days,
    recentReadings: recent.length,
    recentHighReadings: recent.filter((l) => l.isHighRisk).length,
    // การบันทึกสุขภาพในช่วง days วันล่าสุด: กี่คน กี่ครั้ง
    recording: {
      bp: { patients: people(recent), records: recent.length },
      weight: { patients: people(recentWeights), records: recentWeights.length },
      kicks: { patients: people(recentKickDays), records: recentKickDays.length },
    },
  };
}

export type Analytics = ReturnType<typeof buildAnalytics>;
