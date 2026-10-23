# CODEMAP — แผนที่โปรเจค MomSafe (Pregnancy-Journal)

เอกสารนี้ไว้ค้นหาว่า "จะแก้อะไร ต้องไปที่ไฟล์ไหน" — อ่านจากโค้ดจริงทุกไฟล์ใน `src/` (สถานะ working tree ณ 2026-10-24)

> ⚠️ `AGENTS.md` ระบุว่า Next.js เวอร์ชันนี้ (16.3.7) มี breaking changes — ก่อนแก้ API ของ Next (routing, metadata, config) ให้อ่าน `node_modules/next/dist/docs/` ก่อน

## 1. ภาพรวม

- **ชื่อแอป:** MomSafe (key ใน localStorage ยังขึ้นต้น `bumply_` โดยตั้งใจ เพื่อไม่ให้ผู้ใช้เดิมหลุดจากระบบ)
- **Stack:** Next.js 16 (App Router) · React 19 · Tailwind v4 · Framer Motion · Zustand · Firebase Firestore · Recharts · react-hot-toast · lucide-react
- **ภาษา UI:** ไทยทั้งหมด (ฟอนต์ Prompt) · mobile-first, desktop มี sidebar
- **ไม่มี Firebase Auth จริง** — "login" = พิมพ์ชื่อ → ใช้ชื่อ (lowercase) เป็น document id ใน Firestore `users/{name}`
- **ข้อมูลอยู่ 2 ที่:** localStorage (โปรไฟล์ + น้ำหนัก/ลูกดิ้น/ความดันหน้า tracking) กับ Firestore (โปรไฟล์, ความดันจาก Dashboard, ผลความพึงพอใจ)

## 2. ถ้าจะแก้... ให้ไปที่...

| ต้องการแก้ | ไฟล์ |
|---|---|
| เมนูล่าง/ sidebar (เพิ่ม-ลบเมนู, ซ่อมเมนูในบางหน้า) | `src/components/layout/BottomNav.tsx` (`navItems`, `hiddenPaths`) |
| โครงหน้า, ฟอนต์, พื้นหลัง, Toaster, ตัวครอบทุกหน้า | `src/app/layout.tsx` |
| สี/animation/theme ส่วนกลาง | `src/app/globals.css` |
| ชื่อแท็บ / meta | `src/app/layout.tsx` (`metadata`) |
| หน้าแรก (สวัสดี, วงแหวนสัปดาห์, เมนูลัด, ทิปส์ประจำวัน) | `src/app/page.tsx` |
| คำนวณสัปดาห์จากวันกำหนดคลอด (EDD) | `src/app/page.tsx` → `handleEddChange` |
| วงแหวนอายุครรภ์ (40 สัปดาห์, input วันคลอด) | `src/components/ui/AnimatedRing.tsx` |
| ฟอร์มสมัคร/เข้าสู่ระบบด้วยชื่อ (onboarding) | `src/app/onboarding/page.tsx` |
| ออกจากระบบ | `src/app/profile/page.tsx` → `handleLogout`, `userStore.logout` |
| โปรไฟล์ + เมนูโปรไฟล์ | `src/app/profile/page.tsx` |
| แก้ข้อมูลส่วนตัว (modal) | `src/components/modals/EditProfileModal.tsx` |
| ประวัติสุขภาพ + กราฟ (tab ความดัน/น้ำหนัก/ลูกดิ้น) | `src/components/modals/HealthHistoryModal.tsx` |
| บันทึกความดัน **จากหน้าแรก** (ลง Firestore, เตือนถ้า ≥140/90) | `src/components/loggers/BloodPressureLogger.tsx` |
| บันทึกความดัน/น้ำหนัก **จากหน้า tracking** (ลง localStorage) | `src/components/modals/TrackingModals.tsx` + `src/lib/trackingStore.ts` |
| นับลูกดิ้น | `src/app/tracking/page.tsx` (`addKick`) + `trackingStore.ts` |
| หน้า tracking (bento grid) | `src/app/tracking/page.tsx` |
| แบบประเมินความเสี่ยง (คำถาม + คะแนน + เกณฑ์สูง/กลาง/ต่ำ) | `src/app/assessment/page.tsx` (`QUESTIONS`, `calculateRisk`) |
| ข้อสอบ Pre-test / Post-test (คำถาม, เฉลย) | `src/components/quiz/Quiz.tsx` (`QUESTIONS`) — หน้า `pre-test/page.tsx` กับ `post-test/page.tsx` เป็นแค่ wrapper ส่ง `type` + `title` |
| แบบประเมินความพึงพอใจ (8 ข้อ, 1–5 ดาว, บันทึกลง Firestore) | `src/app/satisfaction/page.tsx` |
| ศูนย์ความรู้ (ลำดับขั้น 1-2-3) | `src/app/education/page.tsx` |
| E-book (iframe Heyzine, บังคับแนวนอน) | `src/app/education/ebook/page.tsx` (URL อยู่ใน `<iframe src>`) + ปุ่มเปิดใน `education/page.tsx` |
| วิดีโอ + สรุปเนื้อหา | `src/app/videos/page.tsx` · ไฟล์วิดีโอ `public/videos/Video.mp4` · poster `public/images/lemon.jpg` |
| หน้า Admin (รหัสผ่าน, รายชื่อผู้ใช้, พิมพ์เป็น PDF) | `src/app/admin/page.tsx` |
| Popup แจ้งเตือนกลาง (success/error/warning/info) | UI: `src/components/ui/PopupAlert.tsx` · สั่งเปิด: `useAlertStore.getState().showAlert({...})` จาก `src/lib/alertStore.ts` |
| Overlay "กรุณาหมุนจอ" (บังคับ portrait) | `src/components/ui/PortraitLockOverlay.tsx` |
| แจ้งให้เปิดใน browser หลัก (LINE/FB/IG/Twitter) | `src/components/ui/ExternalBrowserRedirect.tsx` |
| การ์ดเมนูลัด animation | `src/components/ui/AnimatedCard.tsx` |
| เอฟเฟกต์ลอยตอนสำเร็จ/ผลดี | `src/components/ui/FloatingParticles.tsx` |
| ตัวเลขนับขึ้น | `src/components/magicui/number-ticker.tsx` (ใช้ใน AnimatedRing) |
| Firebase config / init | `src/lib/firebase.ts` |
| helper ผสม class (`cn`) | `src/lib/utils.ts` |
| origin ที่อนุญาตตอน dev (tunnel) | `next.config.ts` → `allowedDevOrigins` |
| Deploy (Firebase Hosting) | `firebase.json`, `.firebaserc`, `next.config.ts` (`output: "export"`), auto-deploy: `.github/workflows/firebase-hosting.yml` (push main) |

## 3. Routes (`src/app/`)

| URL | ไฟล์ | หมายเหตุ |
|---|---|---|
| `/` | `page.tsx` | ถ้ายังไม่มี user → redirect `/onboarding` |
| `/onboarding` | `onboarding/page.tsx` | เช็ค/สร้าง doc `users/{name}`; ถ้า Firestore พัง fallback เก็บ local |
| `/tracking` | `tracking/page.tsx` | ไม่ได้เช็คว่า login แล้วหรือยัง |
| `/assessment` | `assessment/page.tsx` | ผลคำนวณแล้ว **ไม่ได้บันทึก** ที่ไหน |
| `/education` | `education/page.tsx` | hub |
| `/education/ebook` | `education/ebook/page.tsx` | |
| `/videos` | `videos/page.tsx` | |
| `/pre-test`, `/post-test` | wrapper → `Quiz` | คะแนน **ไม่ได้บันทึก** ที่ไหน |
| `/satisfaction` | `satisfaction/page.tsx` | บันทึก `satisfaction` ลง `users/{name}` (merge) |
| `/profile` | `profile/page.tsx` | เปิด 2 modal |
| `/admin` | `admin/page.tsx` | ไม่มี link จากเมนู ต้องพิมพ์ URL เอง |

หน้าที่ซ่อม BottomNav: `/onboarding /assessment /pre-test /post-test /satisfaction /admin /education/ebook` (แก้ใน `hiddenPaths`; `/videos` **ไม่ได้อยู่ในรายการ** จึงมีเมนูล่างแสดงอยู่)

## 4. ข้อมูล: เก็บที่ไหน อะไรอ่าน/เขียน

| ข้อมูล | ที่เก็บ | เขียนโดย | อ่านโดย |
|---|---|---|---|
| โปรไฟล์ (`UserProfile`) | localStorage `bumply_user` + Firestore `users/{name}` | `userStore.loginOrSaveUser` (local), onboarding / EditProfileModal (Firestore) | ทุกหน้าผ่าน `useUserStore()` |
| วันกำหนดคลอด (EDD) | localStorage เท่านั้น (ใน `bumply_user`) | `page.tsx` → `handleEddChange` | `AnimatedRing` |
| ความดัน (หน้า tracking) | localStorage `bumply_tracking_data` | `TrackingModals` → `trackingStore.updateBloodPressure` | `tracking/page.tsx` |
| น้ำหนัก, ลูกดิ้น | localStorage `bumply_tracking_data` | `trackingStore` | `tracking/page.tsx` (ประวัติ tab น้ำหนัก/ลูกดิ้นใน HealthHistoryModal ยังว่าง) |
| ความดัน (หน้าแรก) | Firestore `users/{name}/bloodPressures` | `BloodPressureLogger` | `HealthHistoryModal` (30 รายการล่าสุด) |
| ความพึงพอใจ | Firestore `users/{name}.satisfaction` | `satisfaction/page.tsx` | `admin/page.tsx` (type มี field แต่ยังไม่แสดง) |
| Popup state | Zustand (memory) | `showAlert` | `PopupAlert` |

Stores: `src/lib/userStore.ts`, `src/lib/trackingStore.ts` เป็น **custom hook ธรรมดา (useState + localStorage)** ไม่ใช่ Zustand — แต่ละที่ที่เรียกมี state ของตัวเอง ไม่ sync กัน. มีแค่ `alertStore.ts` ที่ใช้ Zustand จริง

## 5. Shared components

```
src/components/
  layout/BottomNav.tsx           เมนูล่าง (mobile) / sidebar (md+)
  loggers/BloodPressureLogger    bottom-sheet บันทึกความดัน → Firestore
  modals/EditProfileModal        แก้โปรไฟล์ → Firestore + local
  modals/HealthHistoryModal      กราฟประวัติ (recharts) 3 tab
  modals/TrackingModals          export: Modal (base), BloodPressureModal, WeightModal
  quiz/Quiz                      ข้อสอบ ใช่/ไม่ใช่ 10 ข้อ ใช้ร่วม pre/post
  ui/AnimatedCard                การ์ดเมนู
  ui/AnimatedRing                วงแหวนสัปดาห์
  ui/FloatingParticles           particle ลอย
  ui/PopupAlert                  popup กลาง (ติดใน layout)
  ui/PortraitLockOverlay         บังคับแนวตั้ง (ติดใน layout)
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

1. **Firebase API key ฝังเป็น fallback ใน `src/lib/firebase.ts`** (ปกติ key ของ web config ไม่ถือเป็นความลับ แต่ความปลอดภัยจริงขึ้นกับ Firestore Security Rules — ไม่มี rules ใน repo ให้ตรวจ)
2. **รหัส Admin เป็น `admin123` เช็คฝั่ง client** และพิมพ์บอกใน placeholder (`admin/page.tsx`) — ใครก็เข้าได้ และ Firestore ที่ถูกอ่านต้องเปิดให้ client อ่านทั้ง collection `users`
5. **ความดันมี 2 ทางที่ไม่เชื่อมกัน:** หน้าแรก → Firestore (+เตือนความเสี่ยง), หน้า tracking → localStorage (ไม่มีเตือน, ไม่เข้ากราฟประวัติ)
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
