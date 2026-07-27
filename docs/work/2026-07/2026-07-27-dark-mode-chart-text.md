# 2026-07-27 — Dark-mode chart text visibility

## What changed
Made recharts text theme-aware across all five chart components (BudgetComparisonChart, TrendLineChart, NetCashFlowChart, RateHistoryChart, ExpensePieChart): added `tick={{ fill: "hsl(var(--muted-foreground))" }}` to every axis and wrapped legend labels in a `hsl(var(--foreground))` span.

## Why
The user reported axis labels (category names, months, y-axis numbers) and legend text were invisible in dark mode. Recharts `stroke` only colors the axis line; tick label text uses `fill`, which defaults to a hardcoded gray invisible on the dark background. Legend text was inheriting the app's pastel series colors, which also vanish in dark mode.

## How
Root-cause fix applied to all charts sharing the pattern, not just the two reported. Axis ticks now use the theme's `muted-foreground`; legend text uses `foreground` (the colored legend icon still distinguishes series). Verified statically (tsc + eslint clean); not verified in a live browser this session (no app login available to the browser tooling).

## Promoted knowledge
When adding recharts charts here, set `tick={{ fill }}` with a theme token on axes and neutralize legend text color — never rely on `stroke` or default fills for text in a themed (light/dark) app.

## Follow-ups
- [ ] Live dark-mode spot-check after the Vercel deploy to confirm contrast on every legend.
