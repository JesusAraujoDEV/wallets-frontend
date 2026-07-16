# 2026-07-16 — Onboarding wired up, frontend audit, dashboard/transactions split + N+1 fix

## What changed
Connected a 6-step animated onboarding tour (`src/components/onboarding/`) that was already fully built in the codebase but never imported anywhere — it now shows automatically on a user's first login and is replayable via a new "Ayuda" button in the sidebar. Ran a full-codebase frontend audit (`docs/audits/2026-07-16-frontend-audit.md`) and fixed its three highest-severity findings: the dead onboarding (above), a dashboard with no empty-state for brand-new accounts (`EmptyDashboardState.tsx`), and an N+1 exchange-rate fetch in the transactions list (was one request per visible date, sometimes per transaction; now one batched `/exchange-rates/history` request per page load). Fixing the latter two required splitting `Index.tsx` (494→81 lines) and `TransactionsList.tsx` (703→147 lines), both already over the project's file-size ceiling and flagged by the audit. Also added `docs/proposals/mobile-app-plan.md`, a planning-only comparison of PWA/Capacitor/React Native paths.

## Why
The owner asked for (1) an animated onboarding/help experience for new users, (2) a frontend audit with the top 2-3 findings fixed inline, and (3) a mobile app plan for later — explicitly no implementation on the mobile piece.

## How
Onboarding: `useOnboarding` hook (`AuthApi.me()` + `localStorage` flag `pwi_onboarding_seen_<userId>`) wired into `SidebarLayout.tsx`; mounted `<OnboardingTour>` there and threaded an `onHelp` callback into `DesktopSidebar`/`MobileSidebarHeader`.

Dashboard split: extracted into `src/pages/dashboard/` — `useDashboardData`, `useDashboardScope`, `useCategoryFilters`, `useDashboardDerived`, `useBalanceSummary`, `useTrendData`, `useDashboardCharts` (the heaviest hook; its category-reindexing logic was duplicated for income/expense and got pulled out into pure helpers in `dashboardChartFilters.ts` so it's written once), plus `DashboardFiltersSection.tsx`/`DashboardChartsGrid.tsx` for JSX. `Index.tsx` is now a thin orchestrator with an `accounts.length === 0` branch rendering `EmptyDashboardState`.

Transactions split: `src/components/transactions-list/` — the rate-fetch fix lives in `useDailyRates` (one `fetchRateHistory({from, to})` call for the whole visible range instead of per-date `getRateByDate` calls) and `useDailyTotals` (per-day income/expense computed synchronously from that batch instead of a `convertToUSDByDate` network call per transaction lacking `amountUsd`). Everything else (filters state, edit form, export dialog, row/list rendering) split out to reach the file under its ceiling without changing behavior.

Verified in-browser against production data both before and after each split: identical dashboard numbers/charts, identical transaction totals and per-row `≈ $X USD` hints, and the `/exchange-rates/history` network call count dropped from N (one per date) to 1.

## Promoted knowledge
`docs/audits/2026-07-16-frontend-audit.md` — full findings list, what's fixed vs. deferred and why.
`docs/proposals/mobile-app-plan.md` — phased recommendation (PWA → Capacitor → React Native), no implementation.

## Follow-ups
- [ ] `Subscriptions.tsx` (1102 lines) has three parallel implementations of the same subscription form — the audit's highest-impact remaining item, deferred because it touches debt-linking business logic that needs a dedicated testing pass.
- [ ] Account/Category management screens (`AccountManager`, `CategoryManager`, their editor dialogs) are still almost entirely in English while the rest of the app is Spanish.
- [ ] Two competing data-fetching patterns (React Query vs. the hand-rolled `storage.ts` Store) coexist, sometimes in the same component — needs an explicit architectural decision, not a drive-by fix.
- [ ] No automated regression test covers the onboarding flow, the empty dashboard state, or the batched rate fetch — all three were verified manually in-browser only.
