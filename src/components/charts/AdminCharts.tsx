"use client";

// กราฟหน้า admin — โหลดแยกผ่าน next/dynamic เหมือน HistoryCharts (recharts ไม่อยู่ใน bundle หลัก)
import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_COLORS, type DailyBP } from "@/lib/analytics";

const axisTick = { fontSize: 12, fill: "#898781" };
const grid = <CartesianGrid vertical={false} stroke="#e1e0d9" />;
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
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 28, left: -20, bottom: 0 }}>
        {grid}
        {/* เกณฑ์ความดันสูง 140/90 — เส้นประเพราะเป็นเกณฑ์ ไม่ใช่ข้อมูล */}
        <ReferenceLine y={140} stroke={CHART_COLORS.critical} strokeOpacity={0.5} strokeDasharray="4 4" label={{ value: "140", position: "right", fill: "#898781", fontSize: 11 }} />
        <ReferenceLine y={90} stroke={CHART_COLORS.critical} strokeOpacity={0.5} strokeDasharray="4 4" label={{ value: "90", position: "right", fill: "#898781", fontSize: 11 }} />
        <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={{ stroke: "#c3c2b7" }} minTickGap={16} />
        <YAxis tick={axisTick} tickLine={false} axisLine={false} domain={[(min: number) => Math.min(min - 10, 60), (max: number) => Math.max(max + 10, 150)]} allowDecimals={false} />
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
