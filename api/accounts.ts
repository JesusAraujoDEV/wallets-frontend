import { config, errorJson, json, sql } from './_db';

export { config };

export default async function handler(request: Request) {
  try {
    const method = request.method.toUpperCase();
    await sql(`CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      currency TEXT NOT NULL CHECK (currency IN ('USD','EUR','VES')),
      balance DOUBLE PRECISION NOT NULL DEFAULT 0
    );`);

    if (method === 'GET') {
      const list = await sql(`SELECT id, name, currency, balance FROM accounts ORDER BY name ASC;`);
      return json(list);
    }

    if (method === 'POST') {
      const body = await request.json();
      const { id, name, currency, balance } = body;
      await sql(
        `INSERT INTO accounts (id, name, currency, balance) VALUES ($1,$2,$3,$4)
         ON CONFLICT (id) DO UPDATE SET name=EXCLUDED.name, currency=EXCLUDED.currency, balance=EXCLUDED.balance;`,
        [id, name, currency, balance]
      );
      return json({ ok: true });
    }

    if (method === 'DELETE') {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');
      if (!id) return errorJson('id required', 400);
      await sql(`DELETE FROM accounts WHERE id = $1;`, [id]);
      return json({ ok: true });
    }

    return errorJson('Method not allowed', 405);
  } catch (e: any) {
    return errorJson(e.message);
  }
}
