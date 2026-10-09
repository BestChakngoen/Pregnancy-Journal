# Design System & Constraints

## Vibe & Emotion
- **Calming, Reassuring, Clean, Warm.**
- The UI should reduce anxiety, avoiding harsh colors or aggressive medical aesthetics.

## Typography
- **Primary Font:** Prompt (for soft, rounded, friendly Thai legibility).
- **Numbers:** Always use `tabular-nums` for counters (gestational age, weight) to prevent layout shifting.
- **Headings:** Use `text-balance` to avoid orphaned words.

## Color Palette
- **Backgrounds:** Pastel gradients (e.g., `#e0f2fe` to `#fdf2f8`).
- **Text:** High-contrast slates (`text-slate-800` for primary, `text-slate-500` for secondary). **No muddy grey on colored backgrounds.**
- **Accents:** Soft Pink (`#f472b6`) and Baby Blue (`#38bdf8`).
- **Alerts (Red Flags):** Soft Corals/Reds (`#fecaca`), avoiding pure neon red (`#ff0000`).

## Impeccable Strict Rules
1. **Strict No White Borders:** No standard white/gray borders. Use glassmorphism (`backdrop-blur`), soft shadows, and semi-transparent white borders (`border-white/60`) instead.
2. **No Generic SaaS Cards:** Avoid standard gray cards. Use background tints that match the brand palette.
3. **60fps Motion:** Animate ONLY `transform` and `opacity` (e.g., using Framer Motion). Do not animate layout properties (width/height/margin).
4. **Hit Areas:** All interactive elements (buttons, bottom nav items) must have a minimum `44x44px` physical hit area for easy one-handed mobile use.
5. **Separation of Concerns:** Keep Business Logic completely decoupled from View components (Strict No God Object).
