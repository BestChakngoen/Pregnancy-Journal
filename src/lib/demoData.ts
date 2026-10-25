// ข้อมูลตัวอย่าง 20 คนสำหรับทดสอบหน้า admin (/admin?demo=1) — สร้างในเครื่อง ไม่อ่าน/เขียน Firebase
// สุ่มแบบกำหนด seed: เปิดกี่ครั้งก็ได้ข้อมูลเดิม แต่วันที่อิงวันนี้ กราฟ 30 วันจึงมีข้อมูลเสมอ
import type { HealthData, PatientDoc } from "@/lib/analytics";
import { ASSESSMENT_QUESTIONS, riskLevelOf } from "@/lib/questions";

const NAMES = [
  "สมใจ", "มาลี", "กานดา", "ปิยะนุช", "วิภา", "ศิริพร", "อรุณี", "นภา", "จันทร์เพ็ญ", "รัตนา",
  "สุดารัตน์", "พรทิพย์", "ชไมพร", "ดวงใจ", "เบญจมาศ", "ลำดวน", "ณัฐธิดา", "กมลวรรณ", "ปวีณา", "ทิพวรรณ",
];

export function buildDemoData(now = new Date()): HealthData {
  let seed = 42;
  const rand = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
  const int = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));
  const daysAgo = (d: number, hour = int(7, 21)) => {
    const t = new Date(now);
    t.setDate(t.getDate() - d);
    t.setHours(hour, int(0, 59), 0, 0);
    return t;
  };
  const pad = (n: number) => String(n).padStart(2, "0");
  const dayId = (t: Date) => `${t.getFullYear()}-${pad(t.getMonth() + 1)}-${pad(t.getDate())}`;

  const data: HealthData = { patients: [], bp: [], weights: [], kicks: [] };

  NAMES.forEach((name, i) => {
    const uid = `demo-${pad(i + 1)}`;
    const lapsed = i % 7 === 5; // 2 คนเลิกบันทึกไป 9 วันแล้ว เพื่อให้เห็นกรณี "ไม่บันทึกนาน"
    const joined = lapsed ? int(15, 29) : int(5, 29);
    const stop = lapsed ? 9 : 0;
    const weeks = int(8, 38);
    const highBP = i % 6 === 0; // ราว 1 ใน 6 คนความดันสูง

    const factors = ASSESSMENT_QUESTIONS.filter(() => rand() < 0.15).map((q) => q.id);
    const totalRisk = ASSESSMENT_QUESTIONS.filter((q) => factors.includes(q.id)).reduce((s, q) => s + q.riskScore, 0);
    const preScore = int(3, 8);

    const p: PatientDoc = {
      id: uid,
      name,
      age: String(int(17, 41)),
      gestationalWeeks: String(weeks),
      gravida: String(int(1, 4)),
      createdAt: daysAgo(joined).toISOString(),
      preTest: { score: preScore, total: 10, at: daysAgo(joined).toISOString() },
    };
    // บางคนยังทำไม่ครบ เพื่อให้เห็นกรณีข้อมูลขาด
    if (i % 5 !== 4) p.assessment = { totalRisk, level: riskLevelOf(totalRisk), factors, at: daysAgo(joined - 1).toISOString() };
    if (i % 4 !== 3) p.postTest = { score: Math.min(10, preScore + int(0, 4)), total: 10, at: daysAgo(int(0, 3)).toISOString() };
    if (i % 3 !== 2) p.satisfaction = Object.fromEntries(Array.from({ length: 8 }, (_, q) => [String(q + 1), int(3, 5)]));

    // ทำซ้ำ: บางคนมี "ครั้งแรก" ต่างจากครั้งล่าสุด — คำนวณจากค่าที่มีอยู่ ไม่ใช้ตัวสุ่ม เพื่อให้ข้อมูลตัวอย่างชุดเดิมไม่เปลี่ยน
    const earlier = (at: string, days: number) => new Date(new Date(at).getTime() - days * 864e5).toISOString();
    if (i % 3 === 0) p.preTestFirst = { ...p.preTest!, score: Math.max(0, preScore - 2), at: earlier(p.preTest!.at, 2) };
    if (p.postTest && i % 4 === 1) p.postTestFirst = { ...p.postTest, score: Math.max(0, p.postTest.score - 2), at: earlier(p.postTest.at, 3) };
    if (p.assessment && i % 5 === 1) p.assessmentFirst = { totalRisk: 0, level: "low", factors: [], at: earlier(p.assessment.at, 2) };
    if (p.satisfaction && i % 3 === 0) p.satisfactionFirst = Object.fromEntries(Object.entries(p.satisfaction).map(([k, v]) => [k, Math.max(1, v - 1)]));
    data.patients.push(p);

    for (let d = joined; d >= stop; d -= int(2, 5)) {
      const systolic = highBP ? int(132, 158) : int(100, 128);
      const diastolic = highBP ? int(84, 100) : int(62, 82);
      data.bp.push({ uid, systolic, diastolic, timestamp: daysAgo(d).toISOString(), isHighRisk: systolic >= 140 || diastolic >= 90 }); // เกณฑ์เดียวกับ isHighBP (healthLogs.ts ดึง Firebase มาด้วยจึงไม่ import)
    }
    let kg = 48 + int(0, 20) + weeks * 0.3;
    for (let d = joined; d >= stop; d -= 7) {
      data.weights.push({ uid, kg: Math.round(kg * 10) / 10, timestamp: daysAgo(d).toISOString() });
      kg += int(2, 8) / 10;
    }
    if (weeks >= 20) {
      for (let d = Math.min(joined, 13); d >= stop; d--) {
        if (rand() < 0.7) data.kicks.push({ uid, date: dayId(daysAgo(d)), count: int(6, 20) });
      }
    }
  });

  data.patients.sort((a, b) => b.createdAt!.localeCompare(a.createdAt!)); // เหมือน orderBy("createdAt", "desc")
  return data;
}

// ผู้ดูแลตัวอย่าง 5 คนสำหรับแท็บ "ผู้ดูแลระบบ" ในโหมดตัวอย่าง — คนแรกคือ "คุณ" (ถอนสิทธิ์ตัวเองไม่ได้ เหมือนของจริง)
// id เป็นตัวอักษร/ตัวเลข 28 ตัว ตรงกับรูปแบบ UID ที่ AdminManager ตรวจ
export const DEMO_ADMINS = ["พว.สมศรี · หัวหน้าวอร์ด", "พว.วันเพ็ญ · เวรเช้า", "พว.กัญญา · เวรบ่าย", "นพ.ธนา · แพทย์เจ้าของไข้", "คุณพิมพ์ · นักวิจัย"].map(
  (name, i) => ({ id: `DemoAdmin${String(i + 1).padStart(19, "0")}`, name })
);
