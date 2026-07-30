# 2026-07-30 — Remove EUR option from the account currency editor

## What changed
`AccountEditorDialog`'s currency select no longer offers EUR (only USD/VES); `AccountEditorValue.currency` narrowed to `"USD" | "VES"`. `useAccountFormDialog` defensively maps a stale `EUR` account record to `USD` when opening the edit form, so the narrower type can never be violated at runtime.

## Why
Found while a parallel session pass built the mobile app's Accounts CRUD screen and confirmed the backend contract: `wallets-backend`'s account schema (`Joi.string().valid('VES', 'USD')`) rejects EUR on both create and update. The web dialog offered it anyway — anyone picking EUR for an account got a 400 from the backend with no clear explanation on screen.

## How
`AccountEditorValue`'s `currency` type is local to `AccountEditorDialog.tsx`, not the shared `Account` type in `src/lib/types.ts` (which still allows `"USD"|"EUR"|"VES"` and is left untouched — it's used by other domains, e.g. debts, where EUR is genuinely valid per that schema). Narrowing scoped to just this account-specific editor avoids touching a type used well beyond this one dialog. `npx tsc --noEmit` clean.

## Promoted knowledge
Account currency is VES/USD only — any future account-related UI should not assume the broader `"USD"|"EUR"|"VES"` union applies; that union is domain-specific per schema (accounts vs. debts vs. transactions), not a single app-wide currency enum.

## Follow-ups
- [ ] Not verified live in a browser this session.
