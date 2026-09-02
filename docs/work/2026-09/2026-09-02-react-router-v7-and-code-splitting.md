# 2026-09-02 — React Router v7 migration and route-level code splitting

## What changed
Bumped `react-router-dom` from 6.30.1 to 7.18.3 (resolves the remaining
`high`-severity npm audit advisory left from the previous patch). Converted
all page-level route components in `App.tsx` to `React.lazy()` + `Suspense`.
Removed two unused `import * as Icons from "lucide-react"` wildcard imports
that were dead code but still pulled the entire icon package into the
bundle, and replaced `CategoryIcon.tsx`'s own wildcard fallback with a
closed, named-import icon map (`src/lib/categoryIconMap.ts`).

## Why
Follow-up to issue #1 (Santiago Perrotta) and its earlier partial fix
(2026-09-02, npm-audit patch PR). Two things remained: the routing library's
last high-severity CVE, and the single ~2.5MB JS bundle Lighthouse flagged
for code-splitting.

## How
- `react-router-dom@7` is a drop-in replacement for the declarative
  `<BrowserRouter>`/`<Routes>`/`<Route>` API this app uses (no data-router
  APIs like `createBrowserRouter` in use) — no route or component changes
  needed beyond the version bump. Build and `tsc --noEmit` both clean.
- Route components are now `lazy(() => import(...))`, wrapped in a single
  `<Suspense fallback={<RouteFallback />}>` around `<Routes>`. Chunks are
  fetched per navigation instead of upfront.
- While auditing bundle size after the route split, two chunks stayed over
  500KB: one turned out to be `CategoryIcon.tsx`'s `import * as LucideIcons`
  fallback (~750KB, used to resolve arbitrary icon names dynamically), the
  other traced to two components (`CategorySelector.tsx`,
  `TransactionRow.tsx`) with an *unused* `import * as Icons` left over from
  earlier refactors. Root-caused both: category icons are already a closed
  set (`src/lib/categoryIcons.ts` for the picker + a handful of backend
  system icons), so `categoryIconMap.ts` now lists them as named imports —
  tree-shakeable, no wildcard.
- Net effect: 1 monolithic 2.5MB chunk → ~75 chunks, only one (~700KB, the
  shared React/query/UI vendor floor loaded on first paint) still over the
  500KB warning threshold.

## Promoted knowledge
None — no living guide covers bundle composition; the reasoning here is
narrative, not a rule to enforce going forward. If another `import * as`
from an icon/utility package shows up in review, treat it as the same class
of bug this entry describes.

## Follow-ups
- [ ] The remaining ~700KB vendor chunk could be split further via
      `build.rollupOptions.output.manualChunks` (e.g. isolate MUI date
      pickers, recharts) if it becomes worth the added complexity — not
      done here, diminishing returns for what was asked.
- [ ] Re-run the Lighthouse audit from issue #1 against the deployed build
      once this merges, to confirm the Best Practices/Performance score
      actually moved, and report back on the issue.
