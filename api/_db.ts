import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
if (!DATABASE_URL) {
  console.warn('DATABASE_URL is not set. API routes will fail until it is configured.');
}

export function getSql() {
  if (!DATABASE_URL) throw new Error('DATABASE_URL not configured');
  return neon(DATABASE_URL);
}

export function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    headers: { 'content-type': 'application/json' },
    ...init,
  });
}

export function errorJson(message: string, status = 500) {
  return json({ error: message }, { status });
}

export const config = { runtime: 'edge' } as const;
export const runtime = 'edge' as const;
