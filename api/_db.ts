// api/_db.ts

import { sql } from '@vercel/postgres';

// Exportamos el 'sql' que importamos.
export { sql };

// ¡AQUÍ ESTÁ EL ARREGLO 1!
// Hacemos que 'init' sea opcional con '?'
export function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    headers: { 'content-type': 'application/json' },
    ...init,
  });
}

export function errorJson(message: string, status = 500) {
  // Esta función ya estaba bien, porque sí pasaba el 'init'
  return json({ error: message }, { status });
}