# 2026-07-30 — Rate calculator on the Rates page

## What changed
New `RateCalculator` component mounted on `src/pages/Rates.tsx`, directly below `RateCurrentCards`: an amount input + "from currency" select (VES/USD/EUR/USDT), live-computing the equivalent in the other three currencies as the user types — no submit button.

## Why
The user wants to convert an amount between Bs and USD/EUR/USDT on demand (e.g. "cuánto es 4455 Bs a tasa $, euro o USDT"), reusing the app's real BCV rate rather than doing the math by hand. First epic built under the new cross-repo parity rule — the mobile companion (`platica-app`) got the same feature in the same pass.

## How
Reuses `vesPerUnit` (`src/lib/displayCurrency.ts`) for the VES cross-rate math — the same conversion primitive already used by `RateCurrentCards`/`TxAmount`/`DashboardStats` — rather than a second implementation. Takes the already-fetched `useCurrentExchangeRate()` result as a prop; no second network call. Guards the loading/no-rate states explicitly instead of computing against `undefined`. shadcn `Card`/`Input`/`Select` primitives, no new dependency. `npx tsc --noEmit` and `npm run lint` clean.

## Promoted knowledge
None new — this follows the existing VES-cross-rate conversion pattern already documented via `displayCurrency.ts`'s usage elsewhere; no new architecture.

## Follow-ups
- [ ] Not verified live in a browser this session.
