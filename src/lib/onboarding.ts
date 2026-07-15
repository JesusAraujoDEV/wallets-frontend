const STORAGE_PREFIX = "pwi_onboarding_seen_";

function key(userId: string | number) {
  return `${STORAGE_PREFIX}${userId}`;
}

export function hasSeenOnboarding(userId: string | number): boolean {
  try {
    return localStorage.getItem(key(userId)) === "1";
  } catch {
    return true; // fail closed: never nag if storage is unavailable
  }
}

export function markOnboardingSeen(userId: string | number) {
  try {
    localStorage.setItem(key(userId), "1");
  } catch {
    // ignore storage errors
  }
}

export function resetOnboarding(userId: string | number) {
  try {
    localStorage.removeItem(key(userId));
  } catch {
    // ignore storage errors
  }
}
