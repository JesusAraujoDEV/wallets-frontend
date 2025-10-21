import { sql } from './_db.js';
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

export default async function handler(req, res) {
  try {
    const cookies = parseCookies(req.headers?.cookie);
    const token = cookies['auth_token'];
    if (!token) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }
    const { payload } = await jwtVerify(token, getJwtSecret());
    const id = String(payload.sub || '');
    const username = String(payload.username || '');
    if (!id || !username) {
      res.status(401).json({ error: 'Token inválido' });
      return;
    }
    // Optional: confirm user still exists
    const result = await sql`SELECT id, username FROM public.users WHERE id = ${Number(id)} LIMIT 1;`;
    const user = result.rows[0];
    if (!user) {
      res.status(401).json({ error: 'Usuario no encontrado' });
      return;
    }
    res.status(200).json({ id: String(user.id), username: user.username });
  } catch (e) {
    res.status(401).json({ error: 'No autenticado' });
  }
}
