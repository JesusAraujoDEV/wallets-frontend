import { neon } from '@neondatabase/serverless';

const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;
if (!DATABASE_URL) {
  console.warn('DATABASE_URL is not set. API routes will fail until it is configured.');
}

export const sql = (query: string, params?: any[]) => {
  if (!DATABASE_URL) throw new Error('DATABASE_URL not configured');
  const run = neon(DATABASE_URL);
  // @ts-ignore driver accepts (strings, params)
  return params ? run(query, params) : run(query);
};

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
