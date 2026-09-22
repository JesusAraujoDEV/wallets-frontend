import { lazy, type ComponentType } from "react";

const RELOAD_FLAG = "chunk-reload-attempted";

// A lazy route chunk import can hang forever — neither resolving nor
// rejecting — when the PWA service worker's fetch handler gets stuck on a
// stale precache lookup after a new deploy. `vite:preloadError` only fires
// on an outright rejection, so a hang like that never triggers it, and the
// page is left showing the previous route's content indefinitely (the
// "nothing loads, only F5 works" symptom). Race the import against a
// timeout so a hang surfaces as a rejection.
//
// On failure we reload ONCE (a stale-chunk hang is genuinely cured by a
// fresh load), guarded by a sessionStorage flag so a real broken chunk
// doesn't loop forever. If we already reloaded, we re-throw so the error
// reaches Suspense's error boundary and the user sees a recoverable screen
// instead of a frozen app.
function loadChunk<T extends { default: ComponentType<unknown> }>(
  factory: () => Promise<T>,
  timeoutMs: number,
): Promise<T> {
  return Promise.race([
    factory(),
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error("Route chunk load timed out")), timeoutMs);
    }),
  ]).then((mod) => {
    sessionStorage.removeItem(RELOAD_FLAG);
    return mod;
  }).catch((err) => {
    const alreadyReloaded = sessionStorage.getItem(RELOAD_FLAG) === "1";
    if (alreadyReloaded) {
      sessionStorage.removeItem(RELOAD_FLAG);
      throw err;
    }
    sessionStorage.setItem(RELOAD_FLAG, "1");
    window.location.reload();
    // Reload is async; keep TS happy about the return type until it lands.
    return new Promise<T>(() => {});
  });
}

export function lazyWithTimeout<T extends { default: ComponentType<unknown> }>(
  factory: () => Promise<T>,
  timeoutMs = 8000,
) {
  return lazy(() => loadChunk(factory, timeoutMs));
}
