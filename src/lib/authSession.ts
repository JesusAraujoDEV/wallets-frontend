import type { AuthSession } from "@/lib/auth";

export function persistSession(session: AuthSession) {
  try {
    localStorage.setItem("pwi_token", session.token);
    localStorage.setItem("token", session.token);
    localStorage.setItem("user", JSON.stringify(session.user));
  } catch {
    // ignore storage errors
  }
}
