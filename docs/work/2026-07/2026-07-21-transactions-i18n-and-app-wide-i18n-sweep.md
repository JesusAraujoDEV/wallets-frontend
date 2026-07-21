# 2026-07-21 — Transactions page i18n, budget EUR display, app-wide i18n sweep (in progress)

## What changed
Fixed `src/pages/Transactions.tsx` and `src/components/TransactionsList.tsx`, which had zero i18n coverage — every string hardcoded in Spanish, plus a few stray hardcoded-English strings mixed in (the delete-transaction toast, the income/expense/net badges), so the page never actually reflected the selected language. Added `budgeted_original` display on `BudgetCard.tsx` so a budget converted from a non-USD `rate_source` shows both the converted USD comparison and the original entered amount (e.g. "meta: €48.00"). Started a full-app audit for the same class of bug: a `grep` for Spanish-only characters (á/é/í/ó/ú/ñ/¿/¡) outside `t()` calls across `src/pages` and `src/components` turned up **70 files** with hardcoded text — most of the app was never wired to i18n, only Dashboard, Rates, nav, onboarding, TransactionFilters, and today's earlier Login split had any coverage. Converting all 70 is in progress via parallel agents, tracked outside this entry (see Follow-ups).

## Why
The owner is testing the app with English selected and kept finding screens that render partly or fully in Spanish regardless of the language setting — first Transactions ("revisa todo el tema del idioma"), then explicitly asked for a single full-app pass instead of fixing pages one at a time as they're spotted ("no hagas cosas así por partes... revisa minusiosamente toda la app").

## How
Same pattern as every other i18n fix today: `useTranslation()` + `t("namespace.key")`, new keys added to `src/locales/{es,en,de}.json` under a `transactionsPage.` namespace for the two files fixed directly in this pass. For the 70-file sweep, dispatched parallel agents grouped by feature domain (debts, subscriptions, budgets+categoryGroups landed so far; calendar, auth/login/profile, transactions/accounts/categories, charts+misc still running or queued) — each agent converts its file set to `t()` calls but is explicitly instructed **not** to touch the three locale JSON files directly, to avoid concurrent-write conflicts between agents; instead each reports its new keys (es/en/de) back in a structured list, merged into the locale files by the orchestrating session in one pass per batch.

## Promoted knowledge
None — mechanical extension of the existing i18next setup, no new pattern.

## Follow-ups
- [ ] The 70-file i18n sweep is **not finished** as of this entry — debts, subscriptions, and budgets+categoryGroups domains are converted and merged; calendar, auth/login/profile, transactions/accounts/categories, and charts+misc domains are still in progress. A follow-up work entry will close this out once the full sweep and locale-file merge is complete.
- [ ] No automated test covers i18n key coverage (e.g. a lint rule catching a hardcoded string outside `t()`); this whole class of bug was found by manual `grep`, not tooling — worth considering an eslint rule (`i18next/no-literal-string` or similar) to prevent regressions once the sweep is done.
