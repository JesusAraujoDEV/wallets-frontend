# 2026-07-23 — Exhaustive frontend↔backend API contract audit

## What changed
Audited every endpoint the frontend calls (~14 domains) against the deployed backend (`wallets.irissoftware.lat`), verifying path, method, param names and response shape — GET-verified live, write endpoints checked statically against Joi schemas. Two real defects found and fixed frontend-side:
- **Debt edit** (`src/pages/debts/useDebtFormHandlers.ts`): the edit path reused the create payload, sending `type` + `currency`, which the deployed `updateDebtSchema` (`.unknown(false)`) hard-rejects with a 400 — every debt edit was broken in production. Fixed by stripping both fields on the update branch (they're immutable post-creation).
- **Net cash flow chart** (`src/lib/stats.ts`): the deployed API emits `time_series[].expenses` (plural) and `summary.total_income/total_expenses/avg_savings_rate`, but `fetchNetCashFlow` expected `.expense` and `income_total/expense_total/savings_rate_avg`, so the dashboard's expense line rendered flat. Normalized the response in one place with `??` fallbacks that read both namings.

## Why
The user asked to verify the deployed Platica app is in sync with the current frontend after several days of parallel changes on both repos. The deployed backend was already current (confirmed: uptime shows a restart after the 07-22 fixes; spending-heatmap returns real categories, forecast MTD $592.23) — so the risk was fine contract drift, not a stale deploy. Two such drifts were live-affecting.

## How
Two `crew:spec-compliance` subagents in parallel, split by domain (core money: transactions/accounts/categories/category-groups/budgets/debts; analytics & integrations: stats/summary/exchange-rates/recurring/auth/telegram). Read-only against production (GET only; no writes on real user data), static verification for write endpoints. Both fixes are frontend-only → deploy via Vercel on push, no VPS redeploy. tsc + lint clean; committed as `d9f7bfe`.

## Promoted knowledge
None new. Confirmed in-sync contracts across all six analytics/integration domains and all six money domains; the canonical API contract remains the backend's Swagger (`/api-docs`).

## Follow-ups (latent, no live impact — not fixed)
- [ ] `includeInStats` param is dead plumbing in `src/lib/stats.ts`/summary callers — backend never reads it (stats hardcode `include`, summary reads `analyticsBehavior`). No caller passes it today; safe to remove on a cleanup pass.
- [ ] `recurring-transactions/:id/pay-now`: backend requires an account (`.or('accountId','account_id')`) but the FE type marks it optional — a pay-now with no account would 400. Verify the caller always supplies one.
- [ ] Optional backend cosmetic (needs redeploy): rename net-cash-flow response fields to match the FE contract and drop `includeInStats` acceptance. Not blocking — FE normalizes.
