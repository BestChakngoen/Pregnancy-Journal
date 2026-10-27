// รีเซ็ตรหัสผ่าน / ลบบัญชีล็อกอิน ของผู้ใช้ที่ลืมรหัสผ่าน — รันในเครื่องเจ้าของโปรเจกต์ ครั้งเดียวจบ ไม่ต้องมีเซิร์ฟเวอร์
// ต้องใช้สคริปต์เพราะ client SDK ตั้งรหัสผ่านให้บัญชีอื่นไม่ได้ (ต้องใช้ Admin SDK) และ Admin SDK รันในเครื่องได้ฟรี
//
// เตรียมครั้งแรก: Firebase Console → Project settings → Service accounts → Generate new private key
//   เซฟเป็น serviceAccountKey.json ที่รากโปรเจกต์ (.gitignore กันไว้แล้ว) หรือชี้ไฟล์ด้วย GOOGLE_APPLICATION_CREDENTIALS
//   key นี้มีสิทธิ์เต็มทั้งโปรเจกต์ — ห้ามส่งต่อ ห้าม commit เก็บไว้เฉพาะเครื่องเจ้าของ
//
// ใช้งาน (ใส่ --admin ถ้าเป็นบัญชีผู้ดูแล):
//   node scripts/reset-password.mjs reset <ชื่อ> [รหัสชั่วคราว]   ไม่ใส่รหัส = สุ่มให้ (แนะนำ: รหัสที่พิมพ์เองจะค้างในประวัติคำสั่ง)
//   node scripts/reset-password.mjs delete <ชื่อ> [--yes]        ไม่ใส่ --yes = แค่แสดงว่าจะลบบัญชีใคร
//     delete ลบเฉพาะบัญชีล็อกอิน ให้ชื่อนั้นสมัครใหม่ได้ — ข้อมูลใน Firestore ไม่ถูกลบ (ลบที่หน้า /admin)
import { randomBytes } from "node:crypto";
import { readFileSync } from "node:fs";
import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

// ต้องตรงกับ toEmail ใน src/lib/auth.ts (ชื่อ lowercase → ไบต์ UTF-8 → hex) ไม่งั้นหาบัญชีไม่เจอ
const toEmail = (name, domain) =>
  `${Array.from(new TextEncoder().encode(name.toLowerCase())).map((b) => b.toString(16).padStart(2, "0")).join("")}@${domain}`;

const fail = (message) => {
  console.error(message);
  process.exit(1);
};

const FLAGS = ["--admin", "--yes"];
const args = process.argv.slice(2);
const [command, name, password] = args.filter((a) => !FLAGS.includes(a));
const isAdmin = args.includes("--admin");

if (!["reset", "delete"].includes(command) || !name?.trim()) {
  fail("ใช้: node scripts/reset-password.mjs reset|delete <ชื่อ> [รหัสชั่วคราว] [--admin] [--yes]");
}

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS ?? "serviceAccountKey.json";
let key;
try {
  key = JSON.parse(readFileSync(keyPath, "utf8"));
} catch {
  fail(`อ่านไฟล์ key ไม่ได้: ${keyPath} (วิธีเตรียมอยู่ที่หัวไฟล์นี้)`);
}
initializeApp({ credential: cert(key) });
const auth = getAuth();

const email = toEmail(name.trim(), isAdmin ? "admin.momsafe.app" : "momsafe.app");
const user = await auth.getUserByEmail(email).catch((err) =>
  fail(err.code === "auth/user-not-found" ? `ไม่พบบัญชีชื่อ "${name}" (ชื่อต้องตรงกับที่สมัคร; ถ้าเป็นบัญชีผู้ดูแลให้ใส่ --admin)` : err.message)
);
console.log(`พบบัญชี: ${user.displayName ?? name} (uid ${user.uid})`);

if (command === "reset") {
  const newPassword = password ?? randomBytes(9).toString("base64url");
  await auth.updateUser(user.uid, { password: newPassword }).catch((err) => fail(err.message));
  console.log(`ตั้งรหัสผ่านใหม่แล้ว: ${newPassword}\nแจ้งผู้ใช้ให้ล็อกอินด้วยรหัสนี้ แล้วเปลี่ยนรหัสเองที่หน้าโปรไฟล์`);
} else if (!args.includes("--yes")) {
  console.log("ยังไม่ได้ลบ — ถ้าเป็นบัญชีที่ถูกต้อง ให้รันซ้ำพร้อม --yes");
} else {
  await auth.deleteUser(user.uid);
  console.log("ลบบัญชีล็อกอินแล้ว ชื่อนี้สมัครใหม่ได้ (ข้อมูลใน Firestore ยังอยู่ ลบที่หน้า /admin ถ้าต้องการ)");
}
