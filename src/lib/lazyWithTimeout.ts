import { lazy, type ComponentType } from "react";

// A lazy route chunk import can hang forever — neither resolving nor rejecting
// — when the PWA service worker's fetch handler gets stuck on a stale precache
// lookup after a new deploy. `vite:preloadError` only fires on an outright
// rejection, so a hang like that never surfaces on its own. Race the import
// against a timeout so a hang becomes a normal rejection that Suspense's error
// boundary can catch and offer recovery — instead of a forced full reload,
// which previously masked navigation bugs and could loop.
function loadChunk<T extends { default: ComponentType<unknown> }>(
  factory: () => Promise<T>,
  timeoutMs: number,
): Promise<T> {
  return Promise.race([
    factory(),
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("Route chunk load timed out")), timeoutMs);
    }),
  ]);
}

export function lazyWithTimeout<T extends { default: ComponentType<unknown> }>(
  factory: () => Promise<T>,
  timeoutMs = 15000,
) {
  return lazy(() => loadChunk(factory, timeoutMs));
}
