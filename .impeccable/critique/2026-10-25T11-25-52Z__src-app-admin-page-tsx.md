---
target: critique ในหน้า admin
total_score: 20
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\patip\\Fork repo\\Pregnancy-Journal\\src\\app\\admin\\page.tsx"
target_fingerprint: "sha256:63e12c0055b5edbf9063f870f812a1c750c30ac4289aa4f38ef1d622d432b73c"
target_path: "C:\\Users\\patip\\Fork repo\\Pregnancy-Journal\\src\\app\\admin\\page.tsx"
timestamp: 2026-10-25T11-25-52Z
slug: src-app-admin-page-tsx
---
Method: dual-agent (A: design review · B: detector + browser)

# Critique: Admin (`src/app/admin/page.tsx`)

## Design Health Score
| # | Heuristic | Score | Key Issue |
|---|---|---|---|
| 1 | Visibility of System Status | 2 | Spinner has no text, no "as of" timestamp or refresh, load error renders 0 (page.tsx:76-83) |
| 2 | Match System / Real World | 2 | Mixed "Wk", "(Admin)", "Export PDF"; list sorted by registration date, not clinical priority |
| 3 | User Control and Freedom | 2 | No logout, back button goes to mothers' app, refresh forces re-login |
| 4 | Consistency and Standards | 2 | KPI "high risk 6" vs risk card "3 people"; detail charts differ from overview charts |
| 5 | Error Prevention | 2 | Admin management guarded well, but errors look like all-clear; print drops BP dot |
| 6 | Recognition Rather Than Recall | 2 | KPI doesn't link to the patients it counts; latest BP has no date; unlabeled threshold lines |
| 7 | Flexibility and Efficiency | 1 | No search/filter/sort/CSV/deep link/per-patient print |
| 8 | Aesthetic and Minimalist Design | 2 | Clean but every card equal weight; pink "35 Wk" outranks risk |
| 9 | Error Recovery | 2 | Good denied-UID panel; load error ambiguous with no retry |
| 10 | Help and Documentation | 3 | KPI captions define terms; kick=10 line and risk scoring unexplained |
| **Total** | | **20/40** | **Acceptable** |

## Design Specificity Verdict
LLM: generic admin template (white rounded cards on slate, 4 KPI tiles, chart cards). Product-specific only in dashed 140/90 lines, risk icons, "แม่{name}". Ordered as a research report; patient list starts ~2,545px down on mobile. Pink "35 Wk" pill is the loudest element per card; high-BP signal is an 8px dot.
Detector: CLI 0 findings on 6 files. Browser: 11 nested-cards (4 KPI tiles, 5 section cards, header, demo banner) at desktop and mobile — mostly caused by the mothers'-app shell wrapper in src/app/layout.tsx:49 (max-w-md bg-white/30 shadow-sm) wrapping the admin page. Agrees with LLM review: admin lives inside the mobile consumer shell, which is also what squeezes print to 448px. dark-glow and text-occlusion were false positives from the detector's own overlay. No user-visible overlay (headless).

## Overall Impression
Data presentation is honest (values, denominators, table fallbacks), but the page answers "did the study work?" before "which mother needs a call today?". Biggest opportunity: put mothers needing follow-up at the top.

## What's Working
1. Honest charts: values on bars, denominators, paired gain, "ดูเป็นตาราง" table fallback.
2. Overview status never color-only: icon + Thai text, sr-only BP text, per-card empty states.
3. Thoughtful permission flows: denied-UID panel with copy, can't self-revoke.

## Priority Issues
- [P1] Research-ordered, not triage: sorted by createdAt (page.tsx:64), KPI not clickable, no search/filter, high-risk scattered at positions 3/7/9/12/16/17, green ✓ "low risk" next to 150/96. Fix: "ต้องติดตามวันนี้" section on top sorted by severity, KPI-as-filter, search + filter chips, red rail on high-risk cards, BP-over-threshold text chip overriding green. Command: /impeccable layout
- [P1] PDF loses safety signal: prints at 448px (max-w-md shell), charts clipped, background-graphics-off wipes bars/legend/red dot, no title/date (header print:hidden). Fix: @media print full width, print-color-adjust: exact, print-only report header, text "สูง" marker. Command: /impeccable adapt
- [P1] Error/stale data looks like all-clear: load failure renders "high risk 0"; latest BP undated; "35 Wk" stored, not derived from EDD. Fix: persistent error card + retry, "updated 14:05 · refresh", dated BP chip. Command: /impeccable harden
- [P2] Rare task first, missing controls: AdminManager first after real login; no logout; unlabeled/English header buttons. Fix: tabs ติดตามผู้ป่วย / ผลการศึกษา / ผู้ดูแลระบบ, add logout. Command: /impeccable distill
- [P2] Patient-detail charts weaker style (HistoryCharts): no legend, unlabeled threshold lines, odd ticks, re-animate, no table. Fix: reuse CHART_COLORS/Legend/TableView/labelled ReferenceLine, round ticks, isAnimationActive={false}. Command: /impeccable polish

## Persona Red Flags
Alex: no search/filter/sort/shortcuts/expand-all/CSV; whole-page print only; Esc doesn't close PopupAlert; refresh re-login.
Sam: back button no accessible name (page.tsx:155); whole patient card is one <button> wrapping <h3> + chips; contrast slate-400 ~2.6:1, detail ticks ~2.6:1, amber revoke confirm ~2.1:1; PopupAlert no role="dialog"/focus move.
Ward nurse (phone): first viewport is admin form; patients ~3 screens down; KPI tap does nothing; green ✓ beside 150/96; undated BP; no phone/contacted action; expanded card ~920px.

## Minor Observations
- "High risk" means different things in KPI (6) vs risk card (3).
- Risk card bar scales inconsistent (factor bars vs level bars).
- Daily mean BP across mothers hides individuals who are high.
- Desktop: hole beside satisfaction card, patient cards 1,248px wide with chips hugging left, consumer mesh gradient in margins.
- "รายชื่อผู้ป่วยล่าสุด" ambiguous; section h2s weaker than card titles; "ดูเป็นตาราง" toggles print as orphans.

## Questions to Consider
- With 90 seconds, which list should this open on, and why is it the 5th section?
- Clinical worklist or study report — two pages with two PDFs?
- What does "follow-up" mean without phone, "contacted" mark, or notes?
- Should a mother at 150/96 ever show a green check?
