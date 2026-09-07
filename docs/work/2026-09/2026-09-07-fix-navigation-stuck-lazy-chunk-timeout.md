# 2026-09-07 — Fix navigation getting stuck on the previous page (lazy chunk timeout)

## What changed
Added `lazyWithTimeout()` (`src/lib/lazyWithTimeout.ts`) and swapped it in for
plain `React.lazy()` in `App.tsx` for every route. If a route's lazy chunk
import doesn't resolve within 8 seconds, it forces a full page reload
instead of leaving the app stuck.

## Why
Jesús reported: clicking a sidebar link changes nothing — the previous
page's content stays on screen, no matter which route he clicks next —
recoverable only with a manual F5. Reproduced it live in Chrome (see
session transcript): `location.pathname` genuinely updates on click, no
console errors, no long tasks, `document.readyState` is `"complete"`, yet
the DOM never swaps to the new route's content.

Root cause, confirmed by reading `react-router-dom`'s own source
(`node_modules/react-router/dist/development/dom-export.js`): v7 wraps
every navigation state update in `React.startTransition`. React 18's
documented behavior for a transition that suspends is to keep showing the
previously committed UI — no fallback flash — until the suspended work
resolves. If the lazy `import()` a transition is waiting on never resolves
*or* rejects, the transition never completes and the old page stays up
forever, silently. `vite:preloadError` (added 2026-09-07 earlier the same
day) only fires on an outright import rejection, so it never caught this.

The likely trigger: this session shipped several deploys in a row today.
An already-open tab keeps its old service worker as the active controller
until it reloads; a stale SW's fetch handler can hang instead of falling
through to network when asked for a chunk hash it doesn't recognize from
its now-outdated precache manifest.

## How
`lazyWithTimeout` races the real `import()` against a timeout promise; if
the timeout wins, it reloads the page (the real chunk, or a genuine load
error, then surfaces normally on the fresh load instead of hanging inside
a suppressed transition). This is a symptom-level fix — it does not change
the service worker or router configuration, both of which are correct as
configured; it makes an unresolved import fail loud (via reload) instead
of failing silent and permanent.

## Promoted knowledge
None.

## Follow-ups
- [ ] If this recurs even right after a fresh page load (no stale SW
      possible), that would point to a different cause and needs its own
      investigation — the timeout would still mask it as "eventually
      reloads," so watch for repeated reloads on the same route as a sign
      of that.
