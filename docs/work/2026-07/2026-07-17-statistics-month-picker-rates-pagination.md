# 2026-07-17 — Statistics month-vs-month picker, savings rate stat, Rates history pagination

## What changed
Extended the Statistics page (added earlier today) with a fourth comparison mode — pick any two specific months via month/year dropdowns — alongside the existing this-month-vs-last-month, this-month-vs-last-year, and free-form custom-range modes. Added a genuinely new derived stat, savings rate ((income − expense) / income) for the current period with its delta in percentage points vs. the comparison period, next to the existing days/avg-spend/avg-income/net-change cards. Also added client-side pagination (20 rows/page) to `RateHistoryTable` on the Rates screen, which previously rendered its full ~90-row history in one unpaginated scrolling table.

## Why
The owner's first pass at Statistics only reused the existing "current vs previous month" comparison without a way to pick two arbitrary months directly, and without any stat that wasn't just a recomputation of the same MoM numbers — flagged as insufficient ("no agregaste ni siquiera alguna estadística nueva... no me pusiste un selector de mes"). The Rates table pagination gap was called out separately in the same message.

## How
- `useStatisticsComparison` gained a `pick_two_months` preset and a `months: { current: MonthValue, previous: MonthValue }` state slice; `computeRangesForPreset` derives `firstOfMonth`/`lastOfMonth` boundaries from the selected month/year pairs and reuses the same `current_from/to`/`previous_from/to` backend params added earlier today — no backend change needed for this part.
- New `src/pages/statistics/MonthYearSelect.tsx` (two shadcn `Select`s: month name from `statistics.months.*` i18n keys, year from the last 6 years).
- `StatisticsOverviewCards` computes `savingsRate(income, expense)` for both periods and renders the delta as a `hint` line under the stat value (small addition to the existing card-list rendering, no new layout).
- `RateHistoryTable` rewritten from a single scrollable `<table>` to a paginated one (`PAGE_SIZE = 20`, plain Prev/Next `Button`s + "Page X of Y" — reused the existing `Button`/`Table` components rather than the less-flexible anchor-based shadcn `Pagination` primitive). Page resets to 0 on `data` change (new date range fetched) via a `useEffect`.
- Verified: `tsc --noEmit` and `eslint` clean on all touched files (one pre-existing unrelated warning); both dev servers boot without errors; login page loads and all new modules resolve over the network (200 OK) — dashboard/Statistics/Rates screens themselves were not visually exercised, same login-wall constraint as earlier today.

## Promoted knowledge
None — extends the Statistics/Rates patterns established earlier today, no new architecture.

## Follow-ups
- [ ] `RateHistoryTable` pagination is client-side against the already-fetched range (`useExchangeRateHistory({from, to})` still pulls the whole range in one request). Fine at current data volumes (~1 year of daily rows); would need a real paginated API if the fetched range grows much larger.
- [ ] A parity checklist for mirroring today's changes into `platica-app` (mobile) was written at `platica-app/docs/parity-checklist-2026-07-17.md` per the owner's explicit choice to not touch that repo yet — Kiro was mid-fix on its Expo/Gradle build at the time.
