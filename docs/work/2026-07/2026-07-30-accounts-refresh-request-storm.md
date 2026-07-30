# 2026-07-30 — Fix request storm on /accounts (and /categories, /transactions)

## What changed
`AccountsStore.refresh()`, `CategoriesStore.refresh()`, and `TransactionsStore.refresh()` in `src/lib/storage.ts` now go through a `dedupe()` wrapper: concurrent calls share one in-flight request instead of each firing its own `GET`. Every call site that runs a refresh *after a mutation* (account/category/transaction upsert/remove, adjustments, debt payment) now calls `.force()` instead, which always starts a fresh fetch — so a write is never masked by an older in-flight read.

## Why
The user reported the Network tab showing "incontables peticiones" to `/accounts` and the page/DevTools feeling stuck when inspecting. Root cause: these are bare module-singleton stores (no react-query), and ~15 independent components/hooks each call `<Store>.refresh()` in their own mount effect with zero coordination. Any page composing several of them (the dashboard alone mounts half a dozen) fired that many simultaneous `GET /accounts` calls on load, and again on every remount.

## How
Added a small `dedupe()` helper in `storage.ts`: wraps an async factory so a second concurrent caller gets the same pending promise instead of starting a new request; exposes `.force()` for callers that must guarantee a fresh fetch (post-write). Applied to the three stores that had the pattern; `TransfersStore` has no cache/refresh, unaffected. Verified `npx tsc --noEmit` and `eslint` clean on all touched files.

## Promoted knowledge
Any future `XStore.refresh()` added to `storage.ts` should use `dedupe()` from the start, not bolt it on after a request-storm bug report. Call sites that refresh *after their own write* must use `.force()`, not the plain deduped `refresh()`, to avoid a race where the write's own refresh resolves to a promise that started before the write landed.

## Follow-ups
- [ ] Not verified live in a browser this session — worth a quick Network-tab spot check after deploy to confirm the duplicate-request count drops.
- [ ] These stores predate react-query in this codebase; migrating them onto react-query would get this dedup/staleness handling for free plus caching across navigations, but that's a larger refactor out of scope for this fix.
