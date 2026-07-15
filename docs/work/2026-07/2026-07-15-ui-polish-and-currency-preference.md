# 2026-07-15 — UI alignment fixes, dark-mode calendar, currency preference

## What changed
Fixed the Amount/Commission/Date grid in the transaction form (labels of different line-height threw off input alignment). Fixed the MUI `DateCalendar` popover rendering unreadable dark-on-dark in dark mode by wrapping it in an MUI theme synced to `next-themes`, via a new shared `DatePickerField` component that replaced four separate copy-pasted date-picker blocks across the app. Rebuilt `TransactionFilters` (search/type/category/account fields now share one consistent labeled-grid layout instead of a two-row mix of labeled and unlabeled fields; removed the mobile "More Filters" collapsible click; translated the whole filter bar and part of `TransactionsList`'s header/edit dialog to Spanish for consistency with the rest of the app). Added a themed thin scrollbar globally. Added a persisted currency display preference (USD/EUR/USDT) via a new `CurrencyToggle`, used on the Rates page and in account balance VES-equivalent hints.

## Why
The owner flagged, with screenshots: misaligned Amount/Commission/Date inputs, an unreadable dark-mode calendar, an incoherent/mixed-language filter bar, an outdated-looking sidebar scrollbar, and asked for a way to choose which currency (USD/EUR/USDT) balances are shown in.

## How
- `DatePickerField.tsx`: `useTheme()` (next-themes) → MUI `createTheme({palette:{mode}})` → `ThemeProvider` wrapping `LocalizationProvider`+`DateCalendar`. Replaces the duplicated Popover+Button+LocalizationProvider+DateCalendar block in `SingleTransactionForm`, `TransferForm`, and `TransactionsList`'s edit dialog.
- Grid alignment: wrapped each field's `<Label>` in a `min-h-10 flex items-end` container so labels of different line counts still bottom-align, instead of shortening/changing the label text.
- `TransactionFilters.tsx`: single responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-6`) with every field labeled the same way; date-mode radio group and its conditional inputs moved to their own row below a border, instead of being inlined with the label (that inline layout is what caused the wrap seen in the report).
- `displayCurrency.ts`: `localStorage` + a `CustomEvent` so multiple mounted components stay in sync without a context provider. `vesPerUnit(rate, currency)` picks `usdRate`/`eurRate`/`usdtRate` off the already-fetched `ExchangeRate`. Scope: display-only — the app's internal accounting stays in USD (`amountUsd`) regardless of this preference; only the two "≈ X" reference-conversion spots (account balances, Rates page cards) read it.
- Global scrollbar: `scrollbar-width`/`scrollbar-color` (Firefox) + `::-webkit-scrollbar` (Chromium), both driven by `--muted-foreground` so it matches light/dark automatically.

`TransactionsList.tsx` (703 lines, already over the file-size ceiling before this change) blocked one more edit (translating "Load more days") — left as English rather than force a same-day split of a 700-line file; flagged as the top candidate for a future decomposition pass.

## Promoted knowledge
None — `DatePickerField` and `displayCurrency`/`CurrencyToggle` are self-documenting via their own file comments; no separate guide needed yet.

## Follow-ups
- [ ] `TransactionsList.tsx` (703 lines) is the largest remaining oversized component in the app; worth its own split pass.
- [ ] The `≈ $X` per-transaction hints in `TransactionsList` still always compute live in USD/EUR regardless of the new currency preference or the stored `amountUsdt` backfilled today (see `wallets-backend`'s `2026-07-15-usdt-rate-backfill.md`) — not wired together yet.
- [ ] "Load more days" and a few other strings in `TransactionsList.tsx` remain in English; full-file translation deferred pending the split above.
