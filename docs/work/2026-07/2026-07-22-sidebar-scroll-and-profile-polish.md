# 2026-07-22 — Sidebar header/footer pinned, profile cards restyled

## What changed
`DesktopSidebar.tsx`: moved `overflow-y-auto` from the whole `<aside>` down to just the nav-links section, so the "Platica / Dashboard" header and the rate/language/theme/logout footer stay fixed while only the nav list scrolls on short viewports. `ProfileField.tsx`/`ProfileInfoCard.tsx`: replaced hardcoded `slate-*`/`emerald-*` colors with the app's theme tokens (`bg-primary-light`, `text-primary`, `ring-primary/30`) and added per-field icons, matching the existing `DashboardStats` card style.

## Why
The user reported the whole sidebar scrolled as one block, hiding the header/footer on shorter screens, and asked for the profile page to feel less plain ("sazonar un poco más"). The hardcoded slate/emerald colors in the profile cards also silently ignored dark mode.

## How
Matched an existing pattern already in the codebase (`MobileSidebarHeader.tsx`'s `flex-1 overflow-y-auto`) instead of inventing a new scroll approach. For the profile polish, used the `frontend-design` skill against the app's existing pastel-emerald token system rather than introducing new colors — same icon-chip pattern `DashboardStats` cards already use. Delegated to the `crew:frontend-architect` subagent per the user's explicit request to use crew subagents; reviewed and verified the diff (`npx tsc --noEmit` clean) before committing.

## Promoted knowledge
None — CSS/token consistency fixes to existing patterns, no new architecture.

## Follow-ups
- [ ] The sidebar rate indicator (`SidebarRateIndicator.tsx`) was investigated for a reported bug (shows USD rate regardless of selected display currency) but static analysis found no defect — single mount point, correct hook usage, no duplicate/hardcoded component. Live verification wasn't possible this session (no login credentials available to the browser tooling); still open, needs the user to confirm whether it's actually reproducible.
