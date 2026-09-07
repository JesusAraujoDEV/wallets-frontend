# 2026-09-07 — Add a top-level React error boundary

## What changed
Added `AppErrorBoundary`, wrapping the entire app in `App.tsx`. On an
uncaught render error it shows a "Recargar" screen instead of leaving the
last-committed UI frozen with no feedback.

## Why
Jesús reported the dashboard (and other modules) not loading when
navigating between them — only an F5 recovered. Investigation traced the
concrete instance to the `Icons` ReferenceError regression (fixed
separately, same day), but the codebase had **no error boundary anywhere**:
any future uncaught render error, from any cause, produces the identical
symptom. That gap is the real, recurring risk — not just this one bug.

## How
Minimal class component (`getDerivedStateFromError` + `componentDidCatch`,
the only API React offers for this — no library needed), wrapping
`<QueryClientProvider>` at the root. Logs the error to console and offers a
reload button. No routing/data logic touched.

## Promoted knowledge
None — no living guide covers this yet; the boundary is self-explanatory
in place.

## Follow-ups
- [ ] Consider wiring `componentDidCatch` to an error-reporting service
      (Sentry or similar) if silent production crashes become a recurring
      problem — not set up here, this entry only adds the local fallback UI.
