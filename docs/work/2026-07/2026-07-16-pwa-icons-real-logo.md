# 2026-07-16 — Replace placeholder PWA icons with the real Platica mark

## What changed
The PWA icon set (`public/icons/{icon-192,icon-512,icon-512-maskable,apple-touch-icon}.png`) added in `2026-07-16-pwa-and-i18n.md` used a generated "P"-monogram placeholder. Replaced all four with the real brand mark, extracted from `public/platica_background.png` (the existing wordmark asset — an autocropped 247×259 region containing just the "P" glyph, no text), composited onto the app's dark background at each required size.

## Why
The owner pointed out two existing brand assets (`public/favicon.ico`, `public/platica_background.png`) that already had a real logo — the placeholder monogram wasn't necessary.

## How
`public/platica_background.png` is a 1024×559 transparent-background wordmark ("P" mark + "latica" text), not a standalone square icon, so there was no single existing file to just resize. Cropped the left ~26% of the image, autocropped to the mark's alpha bounding box (Pillow), trimmed a few stray pixels of the neighboring "l" letterform, then re-composited the mark onto a solid dark-background square at each icon size — full-bleed for `icon-192`/`icon-512`/`apple-touch-icon`, with extra padding for `icon-512-maskable` since Android crops maskable icons to a shape and content outside the safe zone gets clipped. `favicon.ico` was left untouched (already correct, per the owner). No manifest/config changes — same filenames, same `vite.config.ts` references from the prior entry.

## Promoted knowledge
None.

## Follow-ups
- [ ] None carried over beyond what `2026-07-16-pwa-and-i18n.md` already lists.
