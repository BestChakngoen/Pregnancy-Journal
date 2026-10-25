// เลือกว่าจะเขียน "ครั้งแรก" ด้วยหรือไม่ — ฟังก์ชันล้วน (ไม่มี Firebase/React) จึงทดสอบด้วย node ได้
export type ResultField = "assessment" | "preTest" | "postTest" | "satisfaction";

// คืนข้อมูลที่ต้องเขียนลงโปรไฟล์: ฟิลด์ปกติ = ครั้งล่าสุด, <ฟิลด์>First = ครั้งแรก (เขียนครั้งเดียว — firestore.rules บังคับ)
// - มี "ครั้งแรก" แล้ว: อัปเดตเฉพาะครั้งล่าสุด
// - ยังไม่มี: เขียนครั้งแรกด้วย — ผู้ใช้ก่อนระบบนี้ (มีผลเก็บไว้ชุดเดียว) ถือผลเดิมเป็นครั้งแรก, ไม่เคยทำเลย = ครั้งนี้คือครั้งแรก
export function withFirst(existing: Record<string, unknown> | undefined, field: ResultField, result: unknown): Record<string, unknown> {
  const firstKey = `${field}First`;
  if (existing?.[firstKey] !== undefined) return { [field]: result };
  return { [field]: result, [firstKey]: existing?.[field] ?? result };
}
