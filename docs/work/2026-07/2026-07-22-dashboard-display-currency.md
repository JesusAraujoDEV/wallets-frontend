# 2026-07-22 — Dashboard totals ignored the selected display currency

## What changed
`DashboardStats` (Total Balance, Monthly Income, Monthly Expenses cards) now reads `useDisplayCurrency()` and converts its USD totals through the VES cross-rate before rendering, using a new `convertUsdToDisplay` helper in `lib/displayCurrency.ts`. `ExchangeSnapshot` (`lib/rates.ts`) gained a `vesPerUsdt` field so the USDT conversion path has a rate to convert with, matching what `vesPerUsd`/`vesPerEur` already provided.

## Why
The owner reported that switching the EUR/USD/USDT toggle on `/rates` (`CurrencyToggle`, backed by `useDisplayCurrency`) had no effect on the dashboard cards — they were hardcoded to `$` and USD amounts regardless of the selection. `TxAmount` and `RateCurrentCards` already respected the toggle; `DashboardStats` was the one component that didn't wire it up.

## How
`DashboardStats` already received a `rate: ExchangeSnapshot | null` prop (from `useVESExchangeRate()` in `Index.tsx`), so no new data fetching was needed — just missing the same conversion `TxAmount` already does (`amountUsd * (vesPerUsd / vesPerEur)` for EUR). Added `convertUsdToDisplay(amountUsd, currency, snap)` next to the existing `vesPerUnit`/`currencySymbol` helpers in `displayCurrency.ts` so the conversion logic lives in one place rather than being reimplemented per component. Falls back to the raw USD amount if the target currency's rate isn't available (mirrors `TxAmount`'s existing fallback behavior).

## Promoted knowledge
None — extends an existing display-currency pattern to a component that was missing it, no new architecture.

## Follow-ups
- [ ] None.
