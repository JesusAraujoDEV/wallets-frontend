# 2026-09-02 — Patch npm-audit-flagged vulnerable dependencies

## What changed
Ran `npm audit fix` to resolve non-breaking advisories on `nanoid`, `picomatch`,
`postcss-selector-parser`, and `yaml` (transitive deps pulled in via the build
toolchain). `package-lock.json` updated; `npm run build` verified clean after
the bump. No source files touched.

## Why
GitHub issue #1 (external report, Santiago Perrotta / `Sperrotta10`) flagged
`platica.lat` stuck at 77/100 on Lighthouse's "Best Practices" score across
runs, independent of the browser-extension noise also reported in that issue.
`npm audit` confirmed the cause: 12 known vulnerabilities, several in
runtime-shipped packages (`react-router-dom`, `@remix-run/router`).

## How
`npm audit fix` (no `--force`) — only applied fixes that stay within each
package's existing semver range, so nothing breaking landed here. Verified
with `npm run build` (Vite build succeeds, same single ~2.5MB main chunk as
before — bundle splitting is untouched, tracked separately via the existing
`ponytail:` comment in `vite.config.ts`).

## Promoted knowledge
None — this is a routine dependency patch, no living doc affected.

## Follow-ups
- [ ] `react-router-dom` 6.30.1 → 7.18.3 fixes the remaining `high`-severity
      advisory but is a major-version bump (breaking, needs its own routing
      migration/testing pass) — not done here, needs a deliberate PR.
- [ ] `esbuild`/`vite` moderate advisory only affects the local dev server
      (not the shipped bundle) — low priority, `npm audit fix --force` when
      convenient.
- [ ] Reply to issue #1 with findings; decide whether to also tackle the
      single-bundle code-splitting recommendation Santiago's report implies.
