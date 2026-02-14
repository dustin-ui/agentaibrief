# AgentAIBrief Debug Audit Report
**Date:** 2026-02-14
**Total Issues:** 65 (33 errors, 32 warnings)

---

## 🔴 CRITICAL (Fix Immediately)

### 1. Pricing Page — window.location.href errors
**File:** `src/app/pricing/page.tsx` (lines 90, 105)
**Error:** `react-hooks/immutability` — Cannot modify window.location.href in event handler

```tsx
// Line 90 & 105: These trigger React compiler errors
window.location.href = '/signup';
window.location.href = data.url;
```

**Fix:** Use Next.js router instead:
```tsx
import { useRouter } from 'next/navigation';
const router = useRouter();
router.push('/signup');
// or for Stripe: router.push(data.url);
```

### 2. Success Page — Math.random() in render
**File:** `src/app/success/page.tsx` (lines 9-25, 35)
**Error:** `react-hooks/purity` — Cannot call impure function during render

The confetti animation uses `Math.random()` directly in the component body, causing hydration mismatches and unpredictable re-renders.

**Fix:** Move random generation into useEffect or useMemo with empty deps.

### 3. StickySubscribeBar — setState in effect
**File:** `src/components/StickySubscribeBar.tsx` (line 15)
**Error:** `react-hooks/set-state-in-effect` — Synchronous setState in useEffect causes cascading renders

---

## 🟠 HIGH (Should Fix Soon)

### 4. Pro Dashboard — Multiple `any` types
**File:** `src/app/pro-dashboard/page.tsx` (lines 195, 199, 203, 285, 289)
**Error:** `@typescript-eslint/no-explicit-any` — 7 instances of untyped data

These `any` types hide potential runtime errors. Define proper interfaces for:
- API response data
- User profile data
- Dashboard metrics

### 5. RSS Library — `any` types
**File:** `src/lib/rss.ts` (lines 20, 25)
**Error:** Untyped RSS feed parsing

### 6. Prompts Page — `any` type
**File:** `src/app/prompts/page.tsx` (line 145)

---

## 🟡 MEDIUM (Navigation & SEO)

### 7. Wrong Link Elements (11 instances)
Using `<a>` instead of `<Link>` breaks client-side navigation and hurts performance:

| File | Line | Route |
|------|------|-------|
| about/page.tsx | 14, 147 | `/` |
| demo/DemoBriefing.tsx | 84 | `/` |
| page.tsx | 138, 139 | `/blog/`, `/videos/` |
| preferences/page.tsx | 52, 131 | `/` |
| privacy/page.tsx | 95 | `/` |
| seo-sniper/page.tsx | 129 | `/` |
| terms/page.tsx | 89 | `/` |
| MobileNav.tsx | 46, 47 | `/blog/`, `/videos/` |

**Fix:** Replace `<a href="/">` with `<Link href="/">`

### 8. `<img>` instead of `<Image>` (9 instances)
Slower LCP, no optimization:

| File | Lines |
|------|-------|
| about/page.tsx | 27 |
| demo/DemoBriefing.tsx | 242 |
| newsletter-builder/page.tsx | 281, 299, 366, 382 |
| videos/[slug]/page.tsx | 221, 350 |
| videos/page.tsx | 373 |

---

## 🔵 LOW (Cleanup)

### 9. Unused Variables (14 instances)
Dead code that should be removed:

| File | Variable |
|------|----------|
| api/news/route.ts | `request` |
| api/newsletter/generate-edition/route.ts | `err` |
| api/seo-report/route.ts | `score` |
| content-briefing/page.tsx | `label` |
| contract-analyzer/page.tsx | `analyzeProgress`, `openGoogleCalendar`, `getBestWorstLocal` |
| pro-dashboard/page.tsx | `isLoggedIn`, `isPro`, `isInnerCircle`, `user` |
| prompts/page.tsx | `useCallback` |
| signup/page.tsx | `router` |
| newsletter-builder/page.tsx | `useRef` |
| videos/page.tsx | `useEffect`, `profile` |
| AIToolsSection.tsx | `isPremium` |
| NewsFeed.tsx | `err` |
| SiteNav.tsx | `variant` |

### 10. Unused Expression
**File:** `src/app/seo-command/page.tsx` (line 92)
**Warning:** Expression statement that does nothing

---

## 🏗️ ARCHITECTURAL ISSUES (from previous audit)

### 11. File-based Storage on Serverless ⚠️
These will lose data on Vercel deployments:
- `src/app/api/contract-share/route.ts` — Uses `.data/shared-comparisons/`
- `src/app/api/subscribe/route.ts` — Uses `subscribers.json`

**Fix:** Migrate to Supabase

### 12. In-Memory Cache Ineffective
**File:** `src/app/api/trending/route.ts`
Module-level cache doesn't persist across Vercel cold starts.

### 13. TODO: Preferences Not Saved
**File:** `src/app/api/preferences/route.ts`
```ts
// TODO: Save preferences to database / Constant Contact
```

---

## Summary by Severity

| Severity | Count | Action |
|----------|-------|--------|
| 🔴 Critical | 3 | Fix before next deploy |
| 🟠 High | 3 | Fix this week |
| 🟡 Medium | 20 | Schedule for cleanup sprint |
| 🔵 Low | 14 | Nice to have |
| 🏗️ Architectural | 3 | Plan migration |

---

## Quick Wins (Copy-Paste Fixes)

### Fix Pricing Page (Critical)
```tsx
// Add at top of file
import { useRouter } from 'next/navigation';

// Inside component
const router = useRouter();

// Replace line 90
router.push('/signup');

// Replace line 105
if (data.url) router.push(data.url);
```

### Fix Success Page Confetti (Critical)
```tsx
// Move this into useMemo or useEffect
const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

useEffect(() => {
  const generated = Array.from({ length: 50 }, (_, i) => ({
    id: i,
    delay: Math.random() * 2,
    color: colors[Math.floor(Math.random() * colors.length)],
    size: 6 + Math.random() * 8,
    duration: 2 + Math.random() * 2,
    rotation: Math.random() * 360,
    isCircle: Math.random() > 0.5,
  }));
  setPieces(generated);
}, []); // Run once on mount
```

---

## Build Status
- `npm run build`: ✅ Passes (warnings only)
- `npx tsc --noEmit`: ✅ Clean
- ESLint: ❌ 33 errors, 32 warnings
