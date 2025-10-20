import { config, runtime, errorJson, json, getSql } from './_db.js';

export { config, runtime };

export default async function handler(request: Request) {
  try {
    const method = request.method.toUpperCase();
    const sql = getSql();
    await sql`CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income','expense')),
      color TEXT NOT NULL,
      color_name TEXT NOT NULL
    );`;

    if (method === 'GET') {
      const list = await sql`SELECT id, name, type, color, color_name FROM categories ORDER BY name ASC;`;
      return json(list);
    }
    if (method === 'POST') {
      const body = await request.json();
      const { id, name, type, color, colorName } = body;
      await sql`INSERT INTO categories (id, name, type, color, color_name) VALUES (${id}, ${name}, ${type}, ${color}, ${colorName})
         ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, type=EXCLUDED.type, color=EXCLUDED.color, color_name=EXCLUDED.color_name;`;
      return json({ ok: true });
    }
    if (method === 'DELETE') {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');
      if (!id) return errorJson('id required', 400);
  await sql`DELETE FROM categories WHERE id = ${id};`;
      return json({ ok: true });
    }
    return errorJson('Method not allowed', 405);
  } catch (e: any) {
    return errorJson(e.message);
  }
}
