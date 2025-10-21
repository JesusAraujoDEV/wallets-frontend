import { jwtVerify } from 'jose';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
  return new TextEncoder().encode(secret);
}

function parseCookies(header?: string | string[]) {
  const h = Array.isArray(header) ? header.join(';') : header || '';
  const out: Record<string, string> = {};
  h.split(';').forEach(p => {
    const [k, ...v] = p.trim().split('=');
    if (!k) return;
    out[decodeURIComponent(k)] = decodeURIComponent(v.join('='));
  });
  return out;
}

export async function getUserIdFromReq(req): Promise<number | null> {
  try {
    const cookies = parseCookies(req.headers?.cookie);
    const token = cookies['auth_token'];
    if (!token) return null;
    const { payload } = await jwtVerify(token, getJwtSecret());
    const sub = payload.sub ? Number(payload.sub) : NaN;
    if (!sub || Number.isNaN(sub)) return null;
    return sub;
  } catch {
    return null;
  }
}

export async function requireUserId(req, res): Promise<number | null> {
  const uid = await getUserIdFromReq(req);
  if (!uid) {
    res.status(401).json({ error: 'No autenticado' });
    return null;
  }
  return uid;
}
