export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Método no permitido' });
    return;
  }
  const isProd = process.env.NODE_ENV === 'production';
  const cookie = [
    'auth_token=;',
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    isProd ? 'Secure' : '',
    'Max-Age=0',
  ].filter(Boolean).join('; ');
  res.setHeader('Set-Cookie', cookie);
  res.status(200).json({ ok: true });
}
