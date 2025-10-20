import { config, runtime, errorJson, json, getSql } from './_db.js';

export { config, runtime };

export default async function handler(request: Request) {
  try {
    const method = request.method.toUpperCase();
    const sql = getSql();
    await sql`CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      category_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      amount DOUBLE PRECISION NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income','expense'))
    );`;

    if (method === 'GET') {
      const list = await sql`SELECT id, date, description, category_id as "categoryId", account_id as "accountId", amount, type FROM transactions ORDER BY date DESC, id DESC;`;
      return json(list);
    }
    if (method === 'POST') {
      const body = await request.json();
      const { id, date, description, categoryId, accountId, amount, type } = body as {
        id: string; date: string; description: string; categoryId: string; accountId: string; amount: number; type: 'income' | 'expense'
      };

      // Get previous transaction (if any) to revert its effect
  const prevList = await sql`SELECT id, account_id, amount, type FROM transactions WHERE id = ${id};` as any[];
      const prev = prevList?.[0];
      if (prev) {
        const prevDelta = prev.type === 'income' ? prev.amount : -prev.amount;
  await sql`UPDATE accounts SET balance = ROUND(COALESCE(balance,0) - ${prevDelta}, 2) WHERE id = ${prev.account_id};`;
      }

      // Upsert transaction
      await sql`INSERT INTO transactions (id, date, description, category_id, account_id, amount, type) VALUES (${id}, ${date}, ${description}, ${categoryId}, ${accountId}, ${amount}, ${type})
         ON CONFLICT (id) DO UPDATE SET date=EXCLUDED.date, description=EXCLUDED.description, category_id=EXCLUDED.category_id, account_id=EXCLUDED.account_id, amount=EXCLUDED.amount, type=EXCLUDED.type;`;

      // Apply next effect
      const nextDelta = type === 'income' ? amount : -amount;
  await sql`UPDATE accounts SET balance = ROUND(COALESCE(balance,0) + ${nextDelta}, 2) WHERE id = ${accountId};`;

      return json({ ok: true });
    }
    if (method === 'DELETE') {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');
      if (!id) return errorJson('id required', 400);
      // Fetch existing to revert effect
      const list = await sql`SELECT account_id, amount, type FROM transactions WHERE id = ${id};` as any[];
      const old = list?.[0];
      await sql`DELETE FROM transactions WHERE id = ${id};`;
      if (old) {
        const revert = old.type === 'income' ? -old.amount : old.amount;
        await sql`UPDATE accounts SET balance = ROUND(COALESCE(balance,0) + ${revert}, 2) WHERE id = ${old.account_id};`;
      }
      return json({ ok: true });
    }
    return errorJson('Method not allowed', 405);
  } catch (e: any) {
    return errorJson(e.message);
  }
}
