export type AuthUser = { id: string; username: string };

async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, { headers: { 'content-type': 'application/json' }, credentials: 'include', ...init });
  if (!res.ok) {
    let msg = 'Request failed';
    try { msg = await res.text(); } catch {}
    throw new Error(msg || `${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const AuthApi = {
  async login(username: string, password: string): Promise<AuthUser> {
    const out = await fetchJSON<{ ok: boolean; user: AuthUser }>(`/api/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    return out.user;
  },
  async me(): Promise<AuthUser> {
    return fetchJSON<AuthUser>(`/api/me`, { method: 'GET' });
  },
  async logout(): Promise<void> {
    await fetchJSON(`/api/logout`, { method: 'POST' });
  },
};
