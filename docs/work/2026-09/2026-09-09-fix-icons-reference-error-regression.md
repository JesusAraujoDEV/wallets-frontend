# 2026-09-09 — Fix Icons ReferenceError regression from the code-splitting PR

## What changed
Fixed a `ReferenceError: Icons is not defined` crash in production, hit on
the Transactions page (and anywhere `CategorySelector` renders). Replaced
the broken `(Icons as any)[cat.icon]` bracket lookups in
`TransactionRow.tsx` and `CategorySelector.tsx` with `getCategoryIcon()`
from `CategoryIcon.tsx`. Also added a `vite:preloadError` listener in
`main.tsx` that reloads the page once if a lazy route chunk fails to load.

## Why
The 2026-09-02 code-splitting PR (#3) removed `import * as Icons from
"lucide-react"` from both files as apparently-dead code — a `grep "Icons\."`
missed that both used bracket notation (`Icons[cat.icon]`), not dot access.
That shipped a live `ReferenceError` to production: any transaction or
category with an icon crashed the render tree on that page, reported by
Jesús as needing an F5 to "load" other sidebar modules — consistent with
an uncaught render crash leaving the SPA on its last-committed screen.

## How
Both crash sites now call the same `getCategoryIcon()` the rest of the app
already uses (the closed, named-import icon map from the prior PR), instead
of a raw namespace lookup — so there is exactly one place that resolves an
icon name to a component. Added the `vite:preloadError` reload as a
separate, standard Vite safety net: unrelated to this specific bug, but the
same user-visible symptom (stale chunk after deploy needing an F5) can
recur now that the app ships 75+ chunks instead of one, so it's cheap
insurance against a future instance of it.

## Promoted knowledge
None.

## Follow-ups
- [ ] None — this closes the regression. If "stale until F5" resurfaces
      after a future deploy with the preload-error handler in place, that
      would point to a different cause and needs its own investigation.
