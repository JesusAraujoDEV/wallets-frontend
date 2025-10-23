// Centralized HTTP client for Wallets API
// Uses VITE_BACKEND_URL (expects something like "http://localhost:3001/") and appends "api/" prefix.

// IMPORTANT: Use direct import.meta.env access so Vite can statically replace it at build time
const BASE_RAW = import.meta.env.VITE_BACKEND_URL || "/";

function ensureTrailingSlash(u: string) {
  return u.endsWith("/") ? u : `${u}/`;
}

const BASE = ensureTrailingSlash(BASE_RAW);
const API_PREFIX = "api";

const TOKEN_KEY = "pwi_token";

export function getToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setToken(token: string | null) {
  try {
    if (!token) localStorage.removeItem(TOKEN_KEY);
    else localStorage.setItem(TOKEN_KEY, token);
  } catch {
    // ignore storage errors
  }
}

export function buildApiUrl(path: string): string {
  const clean = path.replace(/^\/+/, "");
  // Always place under /api
  return `${BASE}${API_PREFIX}/${clean}`;
}

export async function apiFetch<T = any>(path: string, init?: RequestInit): Promise<T> {
  const url = path.startsWith("http") ? path : buildApiUrl(path);
  const headers: Record<string, string> = {
    "content-type": "application/json",
    ...(init?.headers as Record<string, string> | undefined),
  };
  const token = getToken();
  if (token) headers["authorization"] = `Bearer ${token}`;

  const res = await fetch(url, { ...init, headers });
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try { msg = await res.text(); } catch {}
    throw new Error(msg || `HTTP ${res.status}`);
  }
  // Some endpoints (e.g., 204/empty) may not have JSON
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) return undefined as unknown as T;
  return res.json() as Promise<T>;
}
