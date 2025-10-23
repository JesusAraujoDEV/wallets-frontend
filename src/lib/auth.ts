export type AuthUser = { id: string | number; username: string };

import { apiFetch, setToken, getToken } from "./http";

export const AuthApi = {
  async login(username: string, password: string): Promise<AuthUser> {
    const out = await apiFetch<{ ok: boolean; token: string; user: { id: number | string; username: string } }>(
      `auth/login`,
      {
        method: "POST",
        body: JSON.stringify({ username, password }),
      }
    );
    if (out?.token) setToken(out.token);
    return { id: String(out.user.id), username: out.user.username };
  },
  async me(): Promise<AuthUser> {
    const out = await apiFetch<{ ok: boolean; user: { id: number | string; username: string } }>(`auth/me`, { method: "GET" });
    return { id: String(out.user.id), username: out.user.username };
  },
  async logout(): Promise<void> {
    try {
      await apiFetch(`auth/logout`, { method: "POST" });
    } finally {
      // Always clear local token
      setToken(null);
    }
  },
  token(): string | null {
    return getToken();
  },
};
