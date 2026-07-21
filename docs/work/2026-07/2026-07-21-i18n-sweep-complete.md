# 2026-07-21 — Full-app i18n sweep completed (471 keys, 70 files)

## What changed
Closed out the i18n sweep started earlier today (see `2026-07-21-transactions-i18n-and-app-wide-i18n-sweep.md`). Every file flagged by a `grep` for Spanish-only characters (á/é/í/ó/ú/ñ/¿/¡) outside `t()` calls — 70 files across debts, subscriptions, budgets, category groups, calendar, auth/login/profile, transactions/accounts/categories, and charts — is now wired to `react-i18next`. Re-ran the same grep after the sweep: down to 2 files, one a false positive (Spanish-language code comments, not user-facing text), the other a genuine miss (`pay-now-modal/PayNowAmountCurrencyFields.tsx`, not included in any batch's file list) fixed directly. Final grep: 0 files.

## Why
The owner asked for a single, complete pass instead of fixing screens one at a time as they were spotted ("no hagas cosas así por partes... revisa minuciosamente toda la app"), after finding mixed-language text on the Transactions page on top of what had already been fixed on Dashboard/Rates/Budgets earlier today.

## How
Seven parallel agents, one per feature domain, each converting its file set to `useTranslation()`/`t()` calls. To avoid concurrent writes to the same three locale files, no agent touched `src/locales/*.json` directly — each reported its new keys (es/en/de) back in a flat `key | es | en | de` format. All ~471 keys from all seven batches were merged in one pass via a small Node script (deep-merges dotted key paths into the existing JSON structure) rather than by hand, to avoid transcription errors at this volume. `getReadableError()` (auth error-message mapping) and `loginSubmitHandler.ts`/`googleLoginHandler.ts` were refactored to accept `t` as a parameter, since they're plain functions, not components, and can't call `useTranslation()` themselves.
Verified: `tsc --noEmit` clean (only the 2 pre-existing unrelated errors), all three locale JSON files parse, `eslint` clean on every touched file, and a final grep sweep confirms no hardcoded Spanish text remains outside comments.

## Promoted knowledge
None — mechanical completion of the existing i18next pattern, no new architecture. The "don't touch locale files, report keys instead" coordination pattern for parallel i18n work is worth remembering if this ever needs to happen again (e.g. adding a 4th language), but isn't a durable architectural fact worth a guide.

## Follow-ups
- [ ] No lint rule prevents a new hardcoded string from being introduced later (e.g. `eslint-plugin-i18next`'s `no-literal-string`). This entire 70-file gap existed because there was no automated guard, only manual `grep` audits — worth adding if the team wants sustained coverage.
- [ ] `NetCashFlowChart.tsx`'s tooltip formatter compares a translated display `name` string against untranslated dataKey literals (`'savings_rate'`, `'net_flow'`) — a pre-existing dead-code mismatch noted by the charts-batch agent, not fixed here since it predates this change and wasn't in scope.
- [ ] `pages/calendar/CalendarGrid.tsx`'s `format(currentMonth, "MMMM yyyy", { locale: es })` is still hardcoded to the Spanish date-fns locale regardless of selected language (same class of bug as the `UniversalDatePicker` fix from earlier today, just not caught by the character-grep since it's not a literal string) — flagged, not fixed in this pass.
