import { config, errorJson, json, sql } from './_db';

export { config };

export default async function handler(request: Request) {
  try {
    const method = request.method.toUpperCase();
    await sql(`CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      description TEXT NOT NULL,
      category_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      amount DOUBLE PRECISION NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('income','expense'))
    );`);

    if (method === 'GET') {
      const list = await sql(`SELECT id, date, description, category_id as "categoryId", account_id as "accountId", amount, type FROM transactions ORDER BY date DESC, id DESC;`);
      return json(list);
    }
    if (method === 'POST') {
      const body = await request.json();
      const { id, date, description, categoryId, accountId, amount, type } = body as {
        id: string; date: string; description: string; categoryId: string; accountId: string; amount: number; type: 'income' | 'expense'
      };

      // Get previous transaction (if any) to revert its effect
      const prevList = await sql(`SELECT id, account_id, amount, type FROM transactions WHERE id = $1;`, [id]) as any[];
      const prev = prevList?.[0];
      if (prev) {
        const prevDelta = prev.type === 'income' ? prev.amount : -prev.amount;
        await sql(`UPDATE accounts SET balance = ROUND(COALESCE(balance,0) - $1, 2) WHERE id = $2;`, [prevDelta, prev.account_id]);
      }

      // Upsert transaction
      await sql(
        `INSERT INTO transactions (id, date, description, category_id, account_id, amount, type) VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (id) DO UPDATE SET date=EXCLUDED.date, description=EXCLUDED.description, category_id=EXCLUDED.category_id, account_id=EXCLUDED.account_id, amount=EXCLUDED.amount, type=EXCLUDED.type;`,
        [id, date, description, categoryId, accountId, amount, type]
      );

      // Apply next effect
      const nextDelta = type === 'income' ? amount : -amount;
      await sql(`UPDATE accounts SET balance = ROUND(COALESCE(balance,0) + $1, 2) WHERE id = $2;`, [nextDelta, accountId]);

      return json({ ok: true });
    }
    if (method === 'DELETE') {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');
      if (!id) return errorJson('id required', 400);
      // Fetch existing to revert effect
      const list = await sql(`SELECT account_id, amount, type FROM transactions WHERE id = $1;`, [id]) as any[];
      const old = list?.[0];
      await sql(`DELETE FROM transactions WHERE id = $1;`, [id]);
      if (old) {
        const revert = old.type === 'income' ? -old.amount : old.amount;
        await sql(`UPDATE accounts SET balance = ROUND(COALESCE(balance,0) + $1, 2) WHERE id = $2;`, [revert, old.account_id]);
      }
      return json({ ok: true });
    }
    return errorJson('Method not allowed', 405);
  } catch (e: any) {
    return errorJson(e.message);
  }
}
