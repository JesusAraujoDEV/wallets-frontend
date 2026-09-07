import { lazy, type ComponentType } from "react";

// A lazy route chunk import can hang forever — neither resolving nor
// rejecting — when the PWA service worker's fetch handler gets stuck on a
// stale precache lookup after a new deploy. `vite:preloadError` only fires
// on an outright rejection, so a hang like that never triggers it, and the
// page is left showing the previous route's content indefinitely (the
// "nothing loads, only F5 works" symptom). Race the import against a
// timeout and force a reload if it doesn't win — a real bug in the chunk
// itself still surfaces as a normal error afterward, on the fresh load.
export function lazyWithTimeout<T extends { default: ComponentType<unknown> }>(
  factory: () => Promise<T>,
  timeoutMs = 8000,
) {
  return lazy(() =>
    Promise.race([
      factory(),
      new Promise<T>((_, reject) => {
        setTimeout(() => reject(new Error("Route chunk load timed out")), timeoutMs);
      }),
    ]).catch((err) => {
      window.location.reload();
      // Reload is async; keep TS happy about the return type until it lands.
      return new Promise<T>(() => {});
    }),
  );
}
