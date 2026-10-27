# CODEMAP — แผนที่โปรเจค MomSafe (Pregnancy-Journal)

เอกสารนี้ไว้ค้นหาว่า "จะแก้อะไร ต้องไปที่ไฟล์ไหน" — อ่านจากโค้ดจริงทุกไฟล์ใน `src/` (สถานะ working tree ณ 2026-10-24)

> ⚠️ `AGENTS.md` ระบุว่า Next.js เวอร์ชันนี้ (16.3.7) มี breaking changes — ก่อนแก้ API ของ Next (routing, metadata, config) ให้อ่าน `node_modules/next/dist/docs/` ก่อน

## 1. ภาพรวม

- **ชื่อแอป:** MomSafe (key ใน localStorage ยังขึ้นต้น `bumply_` โดยตั้งใจ เพื่อไม่ให้ผู้ใช้เดิมหลุดจากระบบ)
- **Stack:** Next.js 16 (App Router) · React 19 · Tailwind v4 · Framer Motion · Zustand · Firebase Firestore · Recharts · react-hot-toast · lucide-react
- **ภาษา UI:** ไทยทั้งหมด (ฟอนต์ Prompt) · mobile-first, desktop มี sidebar
- **Login:** Firebase Auth (Email/Password) โดยแปลงชื่อเป็นอีเมลภายใน `{hex ของชื่อ}@momsafe.app` (`login/page.tsx`); ชื่อที่แสดงเก็บใน `displayName`. ข้อมูลใน Firestore ใช้ **uid** เป็น document id `users/{uid}` (เอา uid จาก `currentUid()` ใน `lib/firebase.ts` ไม่ใช่จาก localStorage) — สิทธิ์ตรวจโดย `firestore.rules`
- **ข้อมูลอยู่ 2 ที่:** localStorage (โปรไฟล์ + ค่าล่าสุดของส่วนบันทึกสุขภาพ ใช้ได้แม้ออฟไลน์) กับ Firestore (โปรไฟล์, ผลแบบทดสอบ/แบบประเมิน, ความดัน/น้ำหนัก/ลูกดิ้นทุกรายการ)

## 2. ถ้าจะแก้... ให้ไปที่...

| ต้องการแก้ | ไฟล์ |
|---|---|
| เมนูล่าง/ sidebar (เพิ่ม-ลบเมนู, ซ่อมเมนูในบางหน้า) | `src/components/layout/BottomNav.tsx` (`navItems`, `hiddenPaths`) |
| โครงหน้า, ฟอนต์, พื้นหลัง, Toaster, ตัวครอบทุกหน้า | `src/app/layout.tsx` |
| สี/animation/theme ส่วนกลาง | `src/app/globals.css` |
| CSS ใหม่ (แยกไฟล์ตามกฎ — ไม่เพิ่มลง `globals.css`) | `src/css/*.css` แล้ว `@import` ที่บนสุดของ `globals.css` (ตอนนี้มี `charts.css` = ปิดกรอบโฟกัสตอนคลิกกราฟ แต่คีย์บอร์ด Tab ยังเห็นกรอบ) |
| ชื่อแท็บ / meta | `src/app/layout.tsx` (`metadata`) |
| หน้าแรก (สวัสดี, วงแหวนสัปดาห์, เมนูลัด, ทิปส์ประจำวัน) | `src/components/sections/HomeSection.tsx` |
| ทิปส์ประจำวัน (หน้าหลัก: สลับข้อเองทุก 8 วินาที เริ่มจากข้อสุ่ม ไม่มีปุ่มควบคุม/หยุด; แก้ข้อความหรือความเร็วที่ไฟล์ข้อมูล) | เนื้อหา + ตัวแปรเวลา + ฟังก์ชันเลือกข้อ `src/lib/dailyTips.ts` (`DAILY_TIPS`, `TIP_INTERVAL_MS`) · การ์ด `src/components/ui/DailyTipCard.tsx` (ทุกข้อซ้อนในกริดเดียว การ์ดสูงเท่าข้อที่ยาวสุด + crossfade; ปิดอนิเมชันเมื่อผู้ใช้ตั้ง "ลดการเคลื่อนไหว") |
| ตั้งวันกำหนดคลอด (EDD) — เก็บค่าที่ตั้งเฉยๆ **ไม่คำนวณอายุครรภ์** (วันกำหนดคลอดแต่ละคนไม่เหมือนกัน; อายุครรภ์แก้ที่โปรไฟล์ > ข้อมูลส่วนตัว) | `src/components/sections/HomeSection.tsx` → `handleEddChange` |
| วงแหวนอายุครรภ์ (40 สัปดาห์, input วันคลอด) | `src/components/ui/AnimatedRing.tsx` |
| หน้าสมัคร/เข้าสู่ระบบด้วยชื่อ + รหัสผ่าน (Firebase Auth) | `src/app/login/page.tsx` (`nameToEmail`, `errorMessage`) |
| ฟอร์มข้อมูลส่วนตัวหลังล็อกอิน (อายุ, อายุครรภ์, Gravida) | `src/app/onboarding/page.tsx` |
| ออกจากระบบ | `src/components/sections/ProfileSection.tsx` → `handleLogout`, `userStore.logout` |
| โปรไฟล์ + เมนูโปรไฟล์ | `src/components/sections/ProfileSection.tsx` |
| การแจ้งเตือนบนมือถือ (ขั้นแรก: ขอสิทธิ์ + สวิตช์ + เลือกเรื่อง + ปุ่มทดสอบ — **ยังไม่มีระบบส่งเตือนอัตโนมัติ** ต้องมี FCM + Cloud Functions; iPhone ยังไม่รองรับ; ค่าตั้งเก็บในเครื่องและล้างตอนออกจากระบบ) | modal: `src/components/modals/NotificationModal.tsx` (เปิดจากเมนูในโปรไฟล์) · ตรรกะล้วน `src/lib/notificationPrefs.ts` · เรียก API เบราว์เซอร์ `src/lib/notifications.ts` · service worker `public/sw.js` (แตะเตือน = เปิดแอป; ไม่แคช ไม่ดักคำขอ) |
| แก้ข้อมูลส่วนตัว (modal) | `src/components/modals/EditProfileModal.tsx` |
| เปลี่ยนรหัสผ่าน (modal) | `src/components/modals/ChangePasswordModal.tsx` (เปิดจากเมนูใน `sections/ProfileSection.tsx`) |
| ประวัติสุขภาพ + กราฟ (tab ความดัน/น้ำหนัก/ลูกดิ้น) | `src/components/sections/TrackingSection.tsx` (แท็บ "ติดตาม") |
| บันทึกความดัน **จากหน้าแรก** (ลง Firestore, เตือนถ้า ≥140/90) | `src/components/loggers/BloodPressureLogger.tsx` |
| บันทึกความดัน/น้ำหนัก **จากหน้า tracking** (ลง localStorage) | `src/components/modals/TrackingModals.tsx` + `src/lib/trackingStore.ts` |
| นับลูกดิ้น | `src/components/sections/HealthLogSection.tsx` (`addKick`) + `trackingStore.ts` |
| เก็บผลแบบประเมิน/แบบทดสอบ **ครั้งแรก + ครั้งล่าสุด** (ทำซ้ำได้ ผลล่าสุดทับของเดิม แต่ครั้งแรกเขียนครั้งเดียว — `firestore.rules` บังคับ; อ่านโปรไฟล์ก่อนเขียน อ่านไม่ได้ = ไม่เก็บ; ผู้ใช้เก่าที่มีผลชุดเดียวถือเป็นครั้งแรกเมื่อทำซ้ำ) | `src/lib/saveResult.ts` (เขียนลง Firestore) · ตรรกะเลือกครั้งแรก `src/lib/firstResult.ts` (ฟังก์ชันล้วน) · admin: Pre ใช้ครั้งแรก/Post ใช้ล่าสุด `analytics.ts` (`baselinePre`), รายคนแสดง "ครั้งแรก → ล่าสุด" ใน `admin/PatientList.tsx` |
| ซิงค์ข้อมูลจาก Cloud **ก่อนบันทึก** (ความดัน/น้ำหนัก/ลูกดิ้น, แก้โปรไฟล์): ดึงรายการล่าสุดมารวมกับในเครื่อง (ใหม่กว่าชนะ), แก้ค่าที่อุปกรณ์อื่นมีรายการใหม่กว่าแล้ว = บันทึกเป็นรายการใหม่ ไม่ทับ, โปรไฟล์เขียนเฉพาะช่องที่แก้; ซิงค์ไม่ได้/ช้าเกิน 3 วินาที = ใช้ข้อมูลในเครื่องตามเดิม | `src/lib/cloudSync.ts` (`pullHealth`, `pullProfile`) · ตรรกะรวมข้อมูล `src/lib/mergeHealth.ts` (ฟังก์ชันล้วน) · ใช้ใน `lib/trackingStore.ts` + `modals/EditProfileModal.tsx` |
| บันทึกสุขภาพ (bento grid; อยู่ต่อท้ายหน้าหลัก) | `src/components/sections/HealthLogSection.tsx` |
| แบบประเมินความเสี่ยง (คำถาม + คะแนน + เกณฑ์สูง/กลาง/ต่ำ) | คำถาม/เกณฑ์: `src/lib/questions.ts` (`ASSESSMENT_QUESTIONS`, `riskLevelOf`) · หน้า: `src/app/assessment/page.tsx` |
| ข้อสอบ Pre-test / Post-test (คำถาม, เฉลย) | `src/components/quiz/Quiz.tsx` (`QUESTIONS`) — หน้า `pre-test/page.tsx` กับ `post-test/page.tsx` เป็นแค่ wrapper ส่ง `type` + `title` |
| แบบประเมินความพึงพอใจ (8 ข้อ, 1–5 ดาว, บันทึกลง Firestore) | คำถาม: `src/lib/questions.ts` (`SATISFACTION_QUESTIONS`) · หน้า: `src/app/satisfaction/page.tsx` |
| ส่วนวิเคราะห์ในหน้า Admin (KPI, กราฟคะแนนก่อน/หลัง, ความเสี่ยง, ความดันรายวัน, ความพึงพอใจ, รายคน) | คำนวณ: `src/lib/analytics.ts` (`buildAnalytics`) · UI: `src/components/admin/AdminAnalytics.tsx`, `PatientList.tsx` · กราฟ: `src/components/charts/AdminCharts.tsx` (lazy) |
| กดค้างที่กราฟบนมือถือเพื่อดูค่า ปล่อยแล้วซ่อน (ทุกกราฟ: admin + ประวัติสุขภาพของคุณแม่) | `src/components/charts/HoldToInspect.tsx` (ห่อ `<ResponsiveContainer>`; ปรับเวลากดค้างที่ `HOLD_MS`) |
| ศูนย์ความรู้ (ลำดับขั้น 1-2-3) | `src/components/sections/EducationSection.tsx` |
| E-book (iframe Heyzine, บังคับแนวนอน) | `src/app/education/ebook/page.tsx` (URL อยู่ใน `<iframe src>`) + ปุ่มเปิดใน `sections/EducationSection.tsx` |
| วิดีโอ + สรุปเนื้อหา | `src/app/videos/page.tsx` · ไฟล์วิดีโอ `public/videos/Video.mp4` · poster `public/images/lemon.jpg` |
| หน้า Admin (ล็อกอินบัญชีโดเมน `@admin.momsafe.app` ที่มีเอกสาร `admins/{uid}`, รายชื่อผู้ใช้, พิมพ์เป็น PDF) | `src/app/admin/page.tsx` · ล็อกอิน/สมัครด้วยรหัสเชิญ: `src/components/admin/AdminAuthForm.tsx` → `redeemAdminInvite` (`src/lib/userAdmin.ts`) · จัดการผู้ดูแล: `src/components/admin/AdminManager.tsx` (admin สร้างรหัสเชิญ `invites/{key}` ใช้ครั้งเดียว อายุ 48 ชม. ให้คนใหม่สมัครเอง / ถอนสิทธิ์คนอื่น ถอนตัวเองไม่ได้; รหัสเชิญแรกสร้างใน Firebase Console เป็นเอกสาร `invites/<hex 32 ตัว>` มี `createdAt` = ตอนนี้) · บัญชีผู้ใช้กับ admin แยกโดเมนอีเมล (`nameToEmail` / `adminNameToEmail` ใน `lib/auth.ts`) |
| ผู้ใช้/admin ลืมรหัสผ่าน (ตั้งรหัสชั่วคราวให้ หรือลบบัญชีล็อกอินที่ค้าง — ทำจากหน้าเว็บไม่ได้เพราะต้องใช้ Admin SDK) | `scripts/reset-password.mjs` รันในเครื่องเจ้าของโปรเจกต์ครั้งเดียวจบ: `node scripts/reset-password.mjs reset <ชื่อ> [--admin]` · ต้องมี `serviceAccountKey.json` (สร้างจาก Console, `.gitignore` กันไว้ ห้าม commit) · วิธีเตรียมอยู่ที่หัวไฟล์ |
| Firestore Security Rules | `firestore.rules` (deploy เอง: `firebase deploy --only firestore:rules` — CI deploy แค่ hosting) |
| Popup แจ้งเตือนกลาง (success/error/warning/info) | UI: `src/components/ui/PopupAlert.tsx` · สั่งเปิด: `useAlertStore.getState().showAlert({...})` จาก `src/lib/alertStore.ts` |
| แจ้งให้เปิดใน browser หลัก (LINE/FB/IG/Twitter) | `src/components/ui/ExternalBrowserRedirect.tsx` |
| การ์ดเมนูลัด animation | `src/components/ui/AnimatedCard.tsx` |
| เอฟเฟกต์ลอยตอนสำเร็จ/ผลดี | `src/components/ui/FloatingParticles.tsx` |
| ตัวเลขนับขึ้น | `src/components/magicui/number-ticker.tsx` (ใช้ใน AnimatedRing) |
| Firebase config / init | `src/lib/firebase.ts` (app + Firestore **lite** — ไม่มี realtime/offline) · Auth แยกที่ `src/lib/auth.ts` (หน้าหลักโหลดแบบ `import()` ตอนใช้) |
| helper ผสม class (`cn`) | `src/lib/utils.ts` |
| origin ที่อนุญาตตอน dev (tunnel) | `next.config.ts` → `allowedDevOrigins` |
| Deploy (Firebase Hosting) | `firebase.json`, `.firebaserc`, `next.config.ts` (`output: "export"`), auto-deploy: `.github/workflows/firebase-hosting.yml` (push main) |

## 3. Routes (`src/app/`)

| URL | ไฟล์ | หมายเหตุ |
|---|---|---|
| `/` | `page.tsx` | รวม 4 section เลื่อนในหน้าเดียว (`#home`=หน้าหลัก+บันทึกสุขภาพ `#tracking`=ประวัติ `#education #profile`); ไม่มี user → redirect `/login` |
| `/login` | `login/page.tsx` | สมัคร/เข้าสู่ระบบ; มีข้อมูลส่วนตัวใน Firestore แล้ว → `/` ไม่มี → `/onboarding` |
| `/onboarding` | `onboarding/page.tsx` | ต้องล็อกอินก่อน (ไม่งั้นเด้งไป `/login`); เช็ค/สร้าง doc `users/{uid}`; ถ้า Firestore พัง fallback เก็บ local |
| `/tracking` | `tracking/page.tsx` | redirect → `/#tracking` (ประวัติสุขภาพ: `sections/TrackingSection.tsx`) |
| `/assessment` | `assessment/page.tsx` | บันทึกผ่าน `lib/saveResult.ts`: ครั้งล่าสุด `users/{uid}.assessment` `{totalRisk, level, factors, at}` + ครั้งแรก `.assessmentFirst` (เขียนครั้งเดียว) |
| `/education` | `education/page.tsx` | redirect → `/#education` (เนื้อหาอยู่ที่ `sections/EducationSection.tsx`) |
| `/education/ebook` | `education/ebook/page.tsx` | |
| `/videos` | `videos/page.tsx` | |
| `/pre-test`, `/post-test` | wrapper → `Quiz` | บันทึกผ่าน `lib/saveResult.ts`: ครั้งล่าสุด `users/{uid}.preTest` / `.postTest` `{score, total, at}` + ครั้งแรก `.preTestFirst` / `.postTestFirst` (เขียนครั้งเดียว) |
| `/satisfaction` | `satisfaction/page.tsx` | บันทึกผ่าน `lib/saveResult.ts`: ครั้งล่าสุด `users/{uid}.satisfaction` + ครั้งแรก `.satisfactionFirst` (เขียนครั้งเดียว) |
| `/profile` | `profile/page.tsx` | redirect → `/#profile` (เนื้อหาอยู่ที่ `sections/ProfileSection.tsx`) |
| `/admin` | `admin/page.tsx` | ไม่มี link จากเมนู ต้องพิมพ์ URL เอง · **ดูแบบตัวอย่าง** `/admin?demo=1` = ผู้ป่วยสมมติ 20 คน + ผู้ดูแลสมมติ 5 คน ไม่ต้องล็อกอิน ไม่แตะ Firebase (ข้อมูลอยู่ที่ `src/lib/demoData.ts`) |

หน้าที่ซ่อม BottomNav: `/login /onboarding /assessment /pre-test /post-test /satisfaction /admin /education/ebook` (แก้ใน `hiddenPaths`; `/videos` **ไม่ได้อยู่ในรายการ** จึงมีเมนูล่างแสดงอยู่)

## 4. ข้อมูล: เก็บที่ไหน อะไรอ่าน/เขียน

| ข้อมูล | ที่เก็บ | เขียนโดย | อ่านโดย |
|---|---|---|---|
| โปรไฟล์ (`UserProfile`) | localStorage `bumply_user` + Firestore `users/{uid}` | `userStore.loginOrSaveUser` (local), onboarding / EditProfileModal (Firestore) | ทุกหน้าผ่าน `useUserStore()` |
| วันกำหนดคลอด (EDD) | localStorage เท่านั้น (ใน `bumply_user`) | `sections/HomeSection.tsx` → `handleEddChange` | `AnimatedRing` |
| ความดัน (ส่วนบันทึกสุขภาพ) | localStorage `bumply_tracking_data` (ค่าล่าสุด) + Firestore `users/{uid}/bloodPressures` | `TrackingModals` → `trackingStore.saveBloodPressure` → `lib/healthLogs.ts` (แก้ไข = ทับรายการเดิม) | `sections/HealthLogSection.tsx`, `TrackingSection.tsx`, admin |
| น้ำหนัก, ลูกดิ้น | localStorage (ค่าล่าสุด/ยอดวันนี้) + Firestore `users/{uid}/weights`, `users/{uid}/kicks/{YYYY-MM-DD}` (`increment`) | `trackingStore` → `lib/healthLogs.ts` | `sections/HealthLogSection.tsx`, `TrackingSection.tsx`, admin |
| ความดัน (หน้าแรก) | Firestore `users/{uid}/bloodPressures` | `BloodPressureLogger` → `lib/healthLogs.ts` | `sections/TrackingSection.tsx` (30 รายการล่าสุด), admin |
| ความพึงพอใจ | Firestore `users/{uid}.satisfaction` | `satisfaction/page.tsx` | `admin/page.tsx` → ส่วนวิเคราะห์ |
| Popup state | Zustand (memory) | `showAlert` | `PopupAlert` |

Stores: `src/lib/userStore.ts`, `src/lib/trackingStore.ts` เป็น **custom hook ธรรมดา (useState + localStorage)** ไม่ใช่ Zustand — แต่ละที่ที่เรียกมี state ของตัวเอง ไม่ sync กัน. มีแค่ `alertStore.ts` ที่ใช้ Zustand จริง

## 5. Shared components

```
src/components/
  layout/BottomNav.tsx           เมนูล่าง (mobile) / sidebar (md+)
  loggers/BloodPressureLogger    bottom-sheet บันทึกความดัน → Firestore
  modals/EditProfileModal        แก้โปรไฟล์ → Firestore + local
  modals/ChangePasswordModal     เปลี่ยนรหัสผ่าน (reauthenticate + updatePassword)
  sections/TrackingSection       ประวัติ 3 tab; กราฟ recharts อยู่ `charts/HistoryCharts.tsx` (lazy ผ่าน next/dynamic)
  modals/TrackingModals          export: Modal (base), BloodPressureModal, WeightModal
  quiz/Quiz                      ข้อสอบ ใช่/ไม่ใช่ 10 ข้อ ใช้ร่วม pre/post
  ui/AnimatedCard                การ์ดเมนู
  ui/AnimatedRing                วงแหวนสัปดาห์
  ui/FloatingParticles           particle ลอย
  ui/PopupAlert                  popup กลาง (ติดใน layout)
  ui/ExternalBrowserRedirect     กัน in-app browser (ติดใน layout)
  magicui/number-ticker.tsx      ใช้ใน AnimatedRing
```

## 6. ไฟล์ที่ไม่ใช่โค้ดแอป

| ไฟล์ | คืออะไร |
|---|---|
| `PRODUCT.md` | สรุปเป้าหมายผลิตภัณฑ์/ฟีเจอร์หลัก |
| `AGENTS.md` (root) | คำเตือน Next.js breaking changes (`next dev` สร้างใหม่เอง) |
| `Assets/` | แผนงาน (`แผน_Web_App_...md`), แบบประเมิน (`.md/.pdf`), วิดีโอต้นฉบับ |
| `public/images/` | `mother-minimalist.jpg` (onboarding), `lemon.jpg` (poster วิดีโอ) |

## 7. จุดที่ควรรู้ก่อนแก้ (พบระหว่างอ่านโค้ด)

1. **Firebase API key ฝังเป็น fallback ใน `src/lib/firebase.ts`** (ปกติ key ของ web config ไม่ถือเป็นความลับ แต่ความปลอดภัยจริงขึ้นกับ Firestore Security Rules — rules อยู่ที่ `firestore.rules`)
2. ~~รหัส Admin `admin123` ฝั่ง client~~ — เปลี่ยนเป็นรายชื่อ `admins/{uid}` + `firestore.rules` แล้ว
5. **ความดันมี 2 ทางเข้า** (ปุ่มลัดหน้าแรก กับส่วนบันทึกสุขภาพ) — ลง `bloodPressures` ที่เดียวกันแล้ว แต่เฉพาะปุ่มลัดหน้าแรกที่แสดงคำเตือนความเสี่ยง
6. **ผล Pre/Post-test และผลประเมินความเสี่ยงไม่ถูกบันทึก** (PRODUCT.md คาดว่าจะวัดความรู้/สรุปผล)
7. **Doc id = ชื่อ lowercase** → คนชื่อซ้ำ = ใช้บัญชีเดียวกัน และ `EditProfileModal` ถ้าเปลี่ยนชื่อจะสร้าง doc ใหม่ แทนที่จะแก้ doc เดิม
8. **หน้าแรกไม่มี Symptom Logger / Red Flag Alert แล้ว** (ลบใน working tree) แต่ `PRODUCT.md` ยังเขียนว่าเป็น core feature
9. ปุ่มกระดิ่งหน้าแรก, ปุ่ม Settings และ "การแจ้งเตือน" ในโปรไฟล์ ยังไม่มี handler
10. ไฟล์ `firebase.ts`, `userStore.ts` มี comment ภาษาไทยที่ encoding เพี้ยน (mojibake) — ไม่กระทบการทำงาน

## 8. คำสั่ง

```bash
npm run dev     # พัฒนา
npm run build   # build เป็น static ลง out/
npm run lint    # eslint
npm run build && firebase deploy --only hosting   # deploy (ต้อง firebase login ก่อน)
```
