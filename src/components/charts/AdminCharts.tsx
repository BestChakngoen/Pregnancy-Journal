"use client";

// กราฟหน้า admin — โหลดแยกผ่าน next/dynamic เหมือน HistoryCharts (recharts ไม่อยู่ใน bundle หลัก)
import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_COLORS, type DailyBP } from "@/lib/analytics";

// #6b6a64 บนพื้นขาว ≈ 5.3:1 (ค่าเดิม #898781 ≈ 3.6:1 ต่ำกว่าเกณฑ์สำหรับตัวอักษร 12px)
const axisTick = { fontSize: 12, fill: "#6b6a64" };
const grid = <CartesianGrid vertical={false} stroke="#e1e0d9" />;
// แกนเป็นเลขกลมเสมอ (ไม่ใช่ค่าข้อมูล ±10 ซึ่งได้เลขแปลกๆ อย่าง 54/79/104)
const ticksBetween = (lo: number, hi: number, step: number) => {
  const start = Math.floor(lo / step) * step;
  const end = Math.ceil(hi / step) * step;
  return Array.from({ length: Math.round((end - start) / step) + 1 }, (_, i) => start + i * step);
};
// ความดัน: ครอบ 60–160 เสมอ เพื่อให้เส้นเกณฑ์ 90/140 อยู่ในกราฟ
const bpTicks = (data: { systolic: number; diastolic: number }[]) =>
  ticksBetween(Math.min(60, ...data.map((d) => d.diastolic)), Math.max(160, ...data.map((d) => d.systolic)), 20);

const tooltipStyle = {
  contentStyle: { borderRadius: 12, border: "1px solid rgba(11,11,11,0.10)", fontSize: 13 },
  labelStyle: { color: "#52514e", marginBottom: 4 },
  itemStyle: { color: "#0b0b0b", fontWeight: 600 },
};

export function ScoreHistogram({ data }: { data: { score: number; pre: number; post: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 8, right: 4, left: -28, bottom: 0 }} barGap={2}>
        {grid}
        <XAxis dataKey="score" tick={axisTick} tickLine={false} axisLine={{ stroke: "#c3c2b7" }} />
        <YAxis allowDecimals={false} tick={axisTick} tickLine={false} axisLine={false} />
        <Tooltip
          {...tooltipStyle}
          cursor={{ fill: "rgba(11,11,11,0.04)" }}
          labelFormatter={(score) => `ได้ ${score} คะแนน`}
          formatter={(value, name) => [`${value} คน`, name]}
        />
        <Bar dataKey="pre" name="ก่อนเรียน" fill={CHART_COLORS.pre} radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
        <Bar dataKey="post" name="หลังเรียน" fill={CHART_COLORS.post} radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function BPTrendChart({ data }: { data: DailyBP[] }) {
  const activeDot = { r: 5, stroke: "#ffffff", strokeWidth: 2 };
  const ticks = bpTicks(data);
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 28, left: -20, bottom: 0 }}>
        {grid}
        {/* เกณฑ์ความดันสูง 140/90 — เส้นประเพราะเป็นเกณฑ์ ไม่ใช่ข้อมูล */}
        <ReferenceLine y={140} stroke={CHART_COLORS.critical} strokeOpacity={0.5} strokeDasharray="4 4" label={{ value: "140", position: "right", fill: "#6b6a64", fontSize: 11 }} />
        <ReferenceLine y={90} stroke={CHART_COLORS.critical} strokeOpacity={0.5} strokeDasharray="4 4" label={{ value: "90", position: "right", fill: "#6b6a64", fontSize: 11 }} />
        <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={{ stroke: "#c3c2b7" }} minTickGap={16} />
        <YAxis tick={axisTick} tickLine={false} axisLine={false} domain={[ticks[0], ticks[ticks.length - 1]]} ticks={ticks} />
        <Tooltip
          {...tooltipStyle}
          cursor={{ stroke: "#c3c2b7" }}
          labelFormatter={(_, items) => {
            const d = items?.[0]?.payload as DailyBP | undefined;
            return d ? `${d.label} · วัด ${d.count} ครั้ง` : "";
          }}
          formatter={(value, name) => [`${value} mmHg`, name]}
        />
        <Line type="monotone" dataKey="systolic" name="ตัวบน (SYS)" stroke={CHART_COLORS.systolic} strokeWidth={2} dot={false} activeDot={activeDot} isAnimationActive={false} />
        <Line type="monotone" dataKey="diastolic" name="ตัวล่าง (DIA)" stroke={CHART_COLORS.diastolic} strokeWidth={2} dot={false} activeDot={activeDot} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ---- กราฟรายคน (กางรายละเอียดในรายชื่อผู้ป่วย)

const thresholdLabel = (value: string) => ({ value, position: "right" as const, fill: "#6b6a64", fontSize: 11 });

export function PatientBPChart({ data }: { data: { label: string; systolic: number; diastolic: number }[] }) {
  const ticks = bpTicks(data);
  const dot = { r: 3, strokeWidth: 0 };
  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 8, right: 28, left: -20, bottom: 0 }}>
        {grid}
        <ReferenceLine y={140} stroke={CHART_COLORS.critical} strokeOpacity={0.5} strokeDasharray="4 4" label={thresholdLabel("140")} />
        <ReferenceLine y={90} stroke={CHART_COLORS.critical} strokeOpacity={0.5} strokeDasharray="4 4" label={thresholdLabel("90")} />
        <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={{ stroke: "#c3c2b7" }} minTickGap={16} />
        <YAxis tick={axisTick} tickLine={false} axisLine={false} domain={[ticks[0], ticks[ticks.length - 1]]} ticks={ticks} />
        <Tooltip {...tooltipStyle} cursor={{ stroke: "#c3c2b7" }} formatter={(value, name) => [`${value} mmHg`, name]} />
        <Line dataKey="systolic" name="ตัวบน (SYS)" stroke={CHART_COLORS.systolic} strokeWidth={2} dot={{ ...dot, fill: CHART_COLORS.systolic }} isAnimationActive={false} />
        <Line dataKey="diastolic" name="ตัวล่าง (DIA)" stroke={CHART_COLORS.diastolic} strokeWidth={2} dot={{ ...dot, fill: CHART_COLORS.diastolic }} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function PatientWeightChart({ data }: { data: { label: string; kg: number }[] }) {
  const kgs = data.map((d) => d.kg);
  const step = Math.max(...kgs) - Math.min(...kgs) > 6 ? 2 : 1;
  const ticks = ticksBetween(Math.min(...kgs) - 0.5, Math.max(...kgs) + 0.5, step);
  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={data} margin={{ top: 8, right: 28, left: -20, bottom: 0 }}>
        {grid}
        <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={{ stroke: "#c3c2b7" }} minTickGap={16} />
        <YAxis tick={axisTick} tickLine={false} axisLine={false} domain={[ticks[0], ticks[ticks.length - 1]]} ticks={ticks} />
        <Tooltip {...tooltipStyle} cursor={{ stroke: "#c3c2b7" }} formatter={(value) => [`${value} กก.`, "น้ำหนัก"]} />
        <Line dataKey="kg" name="น้ำหนัก" stroke={CHART_COLORS.post} strokeWidth={2} dot={{ r: 3, strokeWidth: 0, fill: CHART_COLORS.post }} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function PatientKicksChart({ data }: { data: { label: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 8, right: 28, left: -28, bottom: 0 }}>
        {grid}
        <ReferenceLine y={10} ifOverflow="extendDomain" stroke={CHART_COLORS.critical} strokeOpacity={0.5} strokeDasharray="4 4" label={thresholdLabel("10")} />
        <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={{ stroke: "#c3c2b7" }} minTickGap={8} />
        <YAxis allowDecimals={false} tick={axisTick} tickLine={false} axisLine={false} />
        <Tooltip {...tooltipStyle} cursor={{ fill: "rgba(11,11,11,0.04)" }} formatter={(value) => [`${value} ครั้ง`, "ลูกดิ้น"]} />
        <Bar dataKey="count" name="ลูกดิ้น" fill={CHART_COLORS.post} radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
      </BarChart>
    </ResponsiveContainer>
  );
}
