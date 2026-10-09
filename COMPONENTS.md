# Bumply Design System & Components

This document serves as the source of truth for the reusable UI components in the Bumply application. All new components must adhere to these established patterns.

## 1. Typography & Colors (The "Impeccable" Standard)
- **Text:** Never use hard `#000` or raw gray (`slate-500`). Use semi-transparent dark slates (e.g., `text-slate-800/90` and `text-slate-600/80`) so the pastel background bleeds through, preventing "muddy" text.
- **Glassmorphism:** We do not use solid white cards. Cards are `bg-white/60` (or `/50`) with `backdrop-blur-md` and `border-white/60`.
- **Shadows:** Soft, subtle shadows (`shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]`) rather than harsh default drop shadows.

## 2. Core Components

### `AnimatedCard` (Action Buttons)
- **File:** `src/components/AnimatedCard.tsx`
- **Purpose:** Primary touch targets for main menu actions (Symptom Logger, Calendar, Emergency).
- **Design Specs:**
  - `rounded-3xl` for the main card, `rounded-2xl` (squircle) for the inner icon wrapper.
  - Includes a `shimmer` animation on hover/active state.
  - **Hit Area:** Inherently large due to `p-4` and flex layout, satisfying the 44x44px mobile requirement.

### `AnimatedRing` (Gestational Tracker)
- **File:** `src/components/AnimatedRing.tsx`
- **Purpose:** The hero component of the dashboard, showing pregnancy progress.
- **Design Specs:**
  - Uses `framer-motion` to animate the `strokeDashoffset` of the SVG circle (60fps compositor-only animation).
  - Includes a pulsing/breathing background glow (`blur-3xl opacity-20`).
  - Implements `NumberTicker` for the central digits.

### `NumberTicker` (21st.dev / MagicUI style)
- **File:** `src/components/magicui/number-ticker.tsx`
- **Purpose:** Animates numbers rolling up/down to prevent sudden layout jumps and add premium flair.
- **Design Specs:** Always combined with `tabular-nums` and `tracking-wider`.

## 3. Layout Patterns
- **Free-floating Elements:** When an element is purely informational and highly visual (like the Baby Size emoji `🍈`), **do not** trap it inside a card. Let it float freely on the background gradient with a soft `drop-shadow` to reduce "Card Overload".
- **Proximity:** Always maintain larger margins *between* sections (e.g., `mt-8`) than the gaps *within* the section (`gap-4`), ensuring clear visual hierarchy.
- **Bottom Navigation:** Fixed at the bottom with `pb-safe` for mobile notches, using glassmorphism (`bg-white/80 backdrop-blur-xl`), and ensuring minimum `44x44px` hit areas for each icon.
