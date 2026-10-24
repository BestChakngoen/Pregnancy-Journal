"use client";

// แยก recharts (~120KB gz) ออกจาก bundle หลัก: TrackingSection โหลดไฟล์นี้ผ่าน next/dynamic
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

export function BPChart({ data }: { data: object[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <ReferenceLine y={140} stroke="#fca5a5" strokeDasharray="4 4" />
        <ReferenceLine y={90} stroke="#fca5a5" strokeDasharray="4 4" />
        <XAxis dataKey="displayDate" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }} domain={['dataMin - 10', 'dataMax + 10']} />
        <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.6)', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} labelStyle={{ fontWeight: 'bold', color: '#334155', marginBottom: '4px' }} itemStyle={{ fontWeight: 600, fontSize: '14px' }} />
        <Line type="monotone" dataKey="systolic" name="SYS" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} />
        <Line type="monotone" dataKey="diastolic" name="DIA" stroke="#f472b6" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, fill: '#f472b6', stroke: '#fff', strokeWidth: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function WeightChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={[]} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }} domain={['dataMin - 1', 'dataMax + 1']} />
        <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.6)', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
        <Line type="monotone" dataKey="weight" name="น้ำหนัก" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: '#fff' }} activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function KicksChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={[]} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
        <ReferenceLine y={10} stroke="#fca5a5" strokeDasharray="4 4" />
        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }} dy={10} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 500 }} />
        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.6)', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
        <Bar dataKey="count" name="จำนวนครั้ง" fill="#d946ef" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
