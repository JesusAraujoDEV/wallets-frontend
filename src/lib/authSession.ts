import { setToken } from "@/lib/http";
import type { AuthSession } from "@/lib/auth";

export function persistSession(session: AuthSession) {
  setToken(session.token);
}
