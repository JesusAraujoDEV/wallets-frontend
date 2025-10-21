import { sql } from './_db.js';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET || 'dev-secret-change-me';
  return new TextEncoder().encode(secret);
}

async function readJsonBody(req): Promise<any> {
  try {
    if (req.body && typeof req.body === 'object') return req.body;
    const chunks: Buffer[] = [];
    await new Promise<void>((resolve, reject) => {
      req.on('data', (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
      req.on('end', () => resolve());
      req.on('error', reject);
    });
    const raw = Buffer.concat(chunks).toString('utf8');
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export default async function handler(req, res) {
  const method = (req.method || 'GET').toUpperCase();
  if (method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }

  try {
    const body = await readJsonBody(req);
    const { username, password } = body || {};
    if (!username || !password) {
      res.status(400).json({ error: 'username y password son requeridos' });
      return;
    }

    const result = await sql`SELECT id, username, password_hash FROM public.users WHERE username = ${username} LIMIT 1;`;
    const user = result.rows[0];
    if (!user) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const jwt = await new SignJWT({ sub: String(user.id), username: user.username })
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(getJwtSecret());

    const isProd = process.env.NODE_ENV === 'production';
    const cookie = [
      `auth_token=${jwt}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      isProd ? 'Secure' : '',
      `Max-Age=${60 * 60 * 24 * 7}`,
    ].filter(Boolean).join('; ');

    res.setHeader('Set-Cookie', cookie);
    res.status(200).json({ ok: true, user: { id: String(user.id), username: user.username } });
  } catch (e) {
    console.error('[API] login error', e);
    res.status(500).json({ error: 'Error interno' });
  }
}
