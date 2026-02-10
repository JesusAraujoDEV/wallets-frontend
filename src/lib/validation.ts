export function sanitizeNameInput(value: string) {
  // Only letters (including accents) and spaces
  return value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ\s]/g, "");
}

export function sanitizeEmailInput(value: string) {
  // Allow common email-safe ASCII chars only
  return value.replace(/[^A-Za-z0-9@._%+\-]/g, "");
}

export function sanitizeUsernameInput(value: string) {
  // Lowercase and restrict to allowed username chars
  return value.toLowerCase().replace(/[^a-z0-9._-]/g, "");
}

export function isValidEmail(value: string) {
  return /^[\w.%+\-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(value);
}
