# 2026-07-15 — Tasas screen; stop calling BCV directly from the browser

## What changed
Added a "Tasas" page (current USD/EUR/USDT rate cards, historical line chart, table, 30/90/180/365-day range picker) wired into the sidebar and router. `src/lib/rates.ts` — which fetched `https://bcv-api.irissoftware.lat` directly from the browser with its own `localStorage` cache — now calls only the backend's new `/api/exchange-rates/{current,by-date,history}` endpoints (see the matching entry in `wallets-backend/docs/work/2026-07/2026-07-15-exchange-rates-epic.md`). `TransactionForm.tsx` (631 lines) and `SidebarLayout.tsx` (179 lines) were split into smaller components/hooks in the same change.

## Why
The owner flagged the direct-to-BCV frontend call as architecturally suspect. `system-architect` (consulted from the backend repo) confirmed: third-party integrations belong to the backend, not duplicated per-client with a divergent cache/fallback policy. This repo's half of that fix is switching the client over.

## How
`rates.ts` keeps a new `ExchangeRate`-shaped core (`fetchCurrentRate`, `fetchRateByDate`, `fetchRateHistory` + React Query hooks) for the new screen and the transfer form, plus a legacy-shaped compatibility layer (`ExchangeSnapshot`, `useVESExchangeRate`, `getRateByDate`, `convertToUSD`, `convertToUSDByDate`) so the seven existing consumers (`AccountManager`, `AccountSelector`, `ConfirmPaymentModal`, `DebtPayDialog`, `PayNowModal`, `TransactionsList`, `Index`) kept working without changes. `TransactionForm.tsx` was split into `components/transaction-form/{SingleTransactionForm,TransferForm,AccountOption,TransferArbitrageSummary}.tsx` plus `use{SingleTransactionForm,TransferForm,BcvTransferRate,TransferArbitrage}` hooks and a `validateTransfer.ts` helper — required by the project's file-size hook, which blocked the two-line import edit otherwise. `SidebarLayout.tsx` similarly split into `layout/sidebar/{SidebarNav,DesktopSidebar,MobileSidebarHeader}.tsx` + `navigationItems.ts` + `types.ts`.

Verified in-browser against the real backend: logged in, opened the "New Transaction" dialog, switched to the Transfer tab, and confirmed VES accounts show their live USD-equivalent balance (proving `useCurrentExchangeRate` reaches the new backend endpoint end to end) and both split forms render correctly.

## Promoted knowledge
None — the architecture decision itself lives in the backend repo's work entry; nothing here needed a standalone guide.

## Follow-ups
- [ ] No automated test covers the Rates page or the rate hooks.
- [ ] The seven legacy `rates.ts` consumers weren't migrated to the new `ExchangeRate` shape; if the legacy `ExchangeSnapshot` type needs new fields later, thread them through the compatibility layer too.
