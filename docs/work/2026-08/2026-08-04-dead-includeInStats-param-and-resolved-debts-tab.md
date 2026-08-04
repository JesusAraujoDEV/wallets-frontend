# 2026-08-04 — Dead `includeInStats` param removal and Resolved-debts tab

## What changed
Two unrelated cleanups landed together this session:
1. Removed the `includeInStats` parameter from all 8 functions in `lib/stats.ts` (`fetchNetCashFlow`, `fetchSpendingHeatmap`, `fetchExpenseVolatility`, `fetchComparativeMoM`, `fetchMonthlyForecast`, `fetchIncomeHeatmap`, `fetchIncomeVolatility`, `fetchComparativeMoMIncome`) — dead plumbing, confirmed no caller ever passed it and `wallets-backend`'s `server/` has zero references to the query param.
2. Added a third "Resueltas" tab to the Debts page (`pages/Debts.tsx`, `pages/debts/useDebtQueries.ts`) so debts with `status: "paid"` stop appearing mixed into the "Por Pagar"/"Por Cobrar" lists indefinitely.

## Why
1. Was on the standing pending/follow-ups list from the 2026-08-03 session summary ("plumbing muerto en `lib/stats.ts`, limpieza opcional").
2. User reconciled a debt to `paid` status and noticed it stayed in the same tab as pending/partial debts with no way to see it as resolved — reasonable UX gap, not a bug in the data.

## How
- `stats.ts`: deleted the `includeInStats?: boolean` param and its two `sp.set(...)` lines from each function signature; left `summary.ts` and `exports.ts` untouched since those still have live callers passing the param (out of scope — only `stats.ts` was flagged as dead).
- `useDebtQueries.ts`: `payableDebts`/`receivableDebts` now also filter `d.status !== "paid"`; added `resolvedDebts = debts.filter(d => d.status === "paid")`.
- `Debts.tsx`: grid changed from 2 to 3 columns, added a third `TabsTrigger`/`TabsContent` pair wired to `resolvedDebts`, reusing the existing `DebtGridSection` (which already renders paid debts correctly via `DebtCard`'s `isPaid` computed state — no changes needed there).
- Added `debts.resolvedCount` i18n key to `es.json`, `en.json`, `de.json`.
- Verified with `tsc --noEmit` (clean). Could not verify visually against a live authenticated session — the local dev backend shares the production DB but has a different `JWT_SECRET`, so a production-issued JWT fails signature validation locally; noted as a known gap rather than worked around.

## Promoted knowledge
None — both are scoped cleanups/UI additions to existing patterns, no new architecture.

## Follow-ups
- [ ] Per the cross-repo parity rule, evaluate whether the Resolved-debts tab needs to mirror in `platica-app` — it's a small UX fix rather than a full epic, so may not meet the parity bar; not decided yet.
- [ ] Local dev backend (`wallets-backend`) and production (Dokploy) apparently run different `JWT_SECRET` values — blocks verifying frontend changes locally against a real user session without re-logging in via the actual login form (which the agent won't do — see credential-handling rule). Worth aligning the secrets or documenting an accepted dev-login flow.
