---
target: critique หน้า admin
total_score: 25
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 2
target_identity: "file:C:\\Users\\patip\\Fork repo\\Pregnancy-Journal\\src\\app\\admin\\page.tsx"
target_fingerprint: "sha256:9b007c98cbe614e4354e4acbf202a22743929bff78cc27601f3091d81346dfad"
target_path: "C:\\Users\\patip\\Fork repo\\Pregnancy-Journal\\src\\app\\admin\\page.tsx"
timestamp: 2026-10-25T11-59-02Z
slug: src-app-admin-page-tsx
---
Method: dual-agent (A: design review · B: detector + browser)

# Critique: Admin (`src/app/admin/page.tsx`), round 2 after layout/harden/adapt/distill/polish fixes

## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 3 | "ข้อมูล ณ" timestamp, loading/stale banners present; filter/search results not announced; login button has no pending state |
| 2 | Match System / Real World | 3 | Thai clinical terms, mmHg, ≥140/90; gestational age is signup value, never advances |
| 3 | User Control and Freedom | 2 | Refresh returns to login; no-match state has no clear action; revoke not undoable |
| 4 | Consistency and Standards | 2 | Filter "เสี่ยงสูง 6" vs study risk card "ความเสี่ยงสูง 2"; KPI 6.0→7.8 vs +2.0 (different cohorts); tabs lack arrow keys |
| 5 | Error Prevention | 3 | UID validation + revoke confirm; destructive confirm autofocused; login double-submit possible |
| 6 | Recognition Rather Than Recall | 3 | Values/dates visible; identity and current gestational age require mental work |
| 7 | Flexibility and Efficiency | 1 | No sort, URL state, shortcuts, CSV, bulk actions |
| 8 | Aesthetic and Minimalist Design | 3 | Calm, focused; green chip repeated 12x; long rows on desktop; ragged study grid |
| 9 | Error Recovery | 3 | Error card + retry, stale data kept with timestamp; login errors in modal not inline |
| 10 | Help and Documentation | 2 | No explanation of "ต้องติดตาม" criteria or ordering |
| **Total** | | **25/40** | **Acceptable** (up from 20) |

## Design Specificity Verdict
LLM: content now product-specific (severity sort BP > assessment > inactivity, chips with value + age, 140/90 and 10-kick lines, "(ตามที่กรอก)" labels). Visual form is stock Tailwind admin (appropriate for staff). Missing clinic workflow: contact/identifier, current gestational age, follow-up record.
Detector: CLI 0 findings (also with --no-config). Browser: 16 desktop / 6 mobile / 11 study-tab findings, mostly false positives or overlay artifacts: nested-cards on demo page false (B verified shell neutralized; was 11 real-ish last run), line-length and cramped-padding false, dark-glow/text-occlusion overlay artifacts. Real and agreeing with LLM: nested-cards on admin LOGIN screen (wrapper lacks data-admin, consumer shell visible), flat-type-hierarchy (h1 16 / h2 14 / h3 16 / body 12; steps <1.25), skipped-heading h1→h3 in study tab. No user-visible overlay (headless).

## Overall Impression
Biggest change: first view now answers "ต้องติดตาม · 8 คน" with values and dates; data no longer misleads. But after the list there is no next action — can't contact, can't mark followed-up. Next opportunity: make the follow-up task completable on this page.

## What's Working
1. Triage without expanding: severity sort + chips with value and recency, icon + text (PatientList.tsx:96-110).
2. Honest data states: no false zeros, stale data kept with timestamp (page.tsx:203-224, 281-289).
3. Clinician charts: labeled thresholds, round ticks, table fallback, print header states filter + count.

## Priority Issues
- [P1] Follow-up dead end: rows only have self-chosen name; no phone/HN, no "contacted" record. Fix: collect phone or HN at onboarding, show with tel: link; "บันทึกการติดตาม" (date + note) moving mother to "ติดตามแล้ว" until new signal (needs Firestore rules + onboarding). Command: /impeccable shape
- [P1] Session + view lost on refresh: auth in useState(false) (page.tsx:47), no session restore; tab/filter/q not in URL. Fix: restore Firebase session + recheck admins/{uid}; persist ?tab=&filter=&q=. Command: /impeccable harden
- [P2] Same words, different meanings; missing data shown as safe: "เสี่ยงสูง" BP-or-assessment vs assessment-only; KPI cohorts differ from paired gain; green "no signal" chip when unassessed. Fix: rename filter, paired averages in KPI, neutral "ข้อมูลยังไม่ครบ" chip. Command: /impeccable clarify
- [P2] Cohort BP average hides risk: line never reaches 140 while subtitle says 20 readings hit threshold. Fix: lead with daily count of mothers/readings ≥140/90, average secondary. Command: /impeccable clarify
- [P3] Print not yet a working report: ~7 patients/page as cards; study page 1 half empty; grey body block; charts not resized (score-10 bar overflows). Fix: print-only compact table, 2-col print grid, white body in print, re-render charts on beforeprint. Command: /impeccable adapt

## Persona Red Flags
Alex: refresh → re-login; no sort/CSV/"/" shortcut; filter counts ignore search; tabs no arrow keys.
Sam: filter/search results not announced; 20 identical "รายละเอียด" buttons without patient name, aria-controls → unrendered element (PatientList.tsx:84-93); tabs no roving tabindex; study h1→h3; dialog no focus trap, close ~36px, destructive "ถอนสิทธิ์" autofocused and amber. Passes: visible focus, 320px reflow, slate-500 ~4.7:1, no color-only meaning.
Ward nurse: can't call mother; "9 สัปดาห์ (ตามที่กรอก)" not current; unclear "ต้องติดตาม 8" vs "เสี่ยงสูง 6"; logged out on reload; can't mark done.

## Minor Observations
- Desktop: "รายละเอียด" ~1000px from name; a table would scan faster.
- Study grid: satisfaction card alone with empty column; "ผู้ป่วยทั้งหมด" full-row on mobile.
- Satisfaction bars start at 0 on a 1–5 scale.
- Kicks at 9 weeks: "ยังไม่มีการบันทึก" should be "ยังไม่ถึงช่วงนับลูกดิ้น".
- No-match state lacks "ล้างตัวกรอง".
- Denied-access copy uses "Firebase Console → Firestore" jargon.
- Lots of 12px text; small for Thai on phones.

## Questions to Consider
- After "ต้องติดตาม · 8 คน", what does the nurse do next and where is that action?
- Should a green "no signal" chip ever appear for incomplete data?
- Who is the study tab for — would researchers rather have paired n and CSV?
- Would "new signals since last visit" serve rounds better than a full roster with 5 filters?
