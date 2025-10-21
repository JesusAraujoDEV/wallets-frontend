// api/transactions.ts

import { sql } from './_db.js';

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

/** Helper para saber si sumar o restar del balance */
function getDelta(type: 'ingreso' | 'gasto', amount: number | string): number {
  const numAmount = Number(amount) || 0;
  return type === 'ingreso' ? numAmount : -numAmount;
}

export default async function handler(req, res) {
  console.log(`[API] Recibida petición: ${req.method} ${req.url}`);

  try {
    const method = (req.method || 'GET').toUpperCase();

    if (method === 'GET') {
      console.log('[API] Procesando GET /transactions...');
      const list = await sql`
        SELECT 
          id, 
          date, 
          description, 
          category_id AS "categoryId", 
          account_id AS "accountId", 
          amount,
          currency,
          amount_usd AS "amountUsd",
          exchange_rate_used AS "exchangeRateUsed"
        FROM public.transactions 
        ORDER BY date DESC, id DESC;
      `;
      console.log(`[API] GET /transactions exitoso. Encontrados ${list.rows.length} registros.`);

      const safeList = list.rows.map((tx) => ({
        id: String(tx.id),
        date: tx.date,
        description: tx.description,
        categoryId: String(tx.categoryId),
        accountId: String(tx.accountId),
        amount: Number(tx.amount),
        currency: tx.currency,
        amountUsd: tx.amountUsd ? Number(tx.amountUsd) : null,
        exchangeRateUsed: tx.exchangeRateUsed ? Number(tx.exchangeRateUsed) : null,
      }));

      res.status(200).json(safeList);
      return;
    }

    if (method === 'POST') {
      console.log('[API] Procesando POST /transactions (Crear)...');
      const body = await readJsonBody(req);
      const {
        date,
        description,
        categoryId,
        accountId,
        amount,
        currency,
        amountUsd,
        exchangeRateUsed,
      } = body;

      if (!date || !description || !categoryId || !accountId || amount === undefined || !currency) {
        res.status(400).json({ error: 'Campos requeridos: date, description, categoryId, accountId, amount, currency' });
        return;
      }

      const categoryResult = await sql`SELECT "type" FROM public.categories WHERE id = ${Number(categoryId)};`;
      if (categoryResult.rows.length === 0) {
        res.status(400).json({ error: `La categoría con id ${categoryId} no existe` });
        return;
      }
      const type = categoryResult.rows[0].type as 'ingreso' | 'gasto';

      const insertResult = await sql`
        INSERT INTO public.transactions 
          (date, description, category_id, account_id, amount, currency, amount_usd, exchange_rate_used)
        VALUES 
          (${date}, ${description}, ${Number(categoryId)}, ${Number(accountId)}, ${Number(amount)}, ${currency}, ${amountUsd || null}, ${exchangeRateUsed || null})
        RETURNING id;
      `;
      const newTransactionId = insertResult.rows[0].id;

      const delta = getDelta(type, Number(amount));
      await sql`
        UPDATE public.accounts 
        SET balance = ROUND(COALESCE(balance,0) + ${delta}, 2) 
        WHERE id = ${Number(accountId)};
      `;

      console.log(`[API] POST /transactions exitoso. Nuevo ID: ${newTransactionId}`);
  res.status(200).json({ ok: true, newId: String(newTransactionId) });
      return;
    }

    if (method === 'DELETE') {
      console.log('[API] Procesando DELETE /transactions...');
      const { searchParams } = new URL(req.url, 'http://localhost');
      const id = searchParams.get('id');
      if (!id) {
        res.status(400).json({ error: 'Se requiere "id" en URL' });
        return;
      }

      const numericId = Number(id);
      if (isNaN(numericId)) {
        res.status(400).json({ error: '"id" debe ser un número' });
        return;
      }

      const oldTxResult = await sql`
        SELECT 
          t.account_id, 
          t.amount, 
          c."type"
        FROM public.transactions t
        JOIN public.categories c ON t.category_id = c.id
        WHERE t.id = ${numericId};
      `;

      const old = oldTxResult.rows[0];
      if (!old) {
        console.log(`[API] DELETE: No se encontró ID ${numericId}`);
        res.status(200).json({ ok: true, message: 'No se encontró la transacción' });
        return;
      }

      await sql`DELETE FROM public.transactions WHERE id = ${numericId};`;

      const revertAmount = getDelta(old.type as 'ingreso' | 'gasto', old.amount) * -1;
      await sql`
        UPDATE public.accounts 
        SET balance = ROUND(COALESCE(balance,0) + ${revertAmount}, 2) 
        WHERE id = ${old.account_id};
      `;

      console.log(`[API] DELETE /transactions exitoso. Borrado ID: ${id}`);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'Método no permitido' });
  } catch (e) {
    console.error(`[API] ¡Error en /transactions!`, (e as any)?.message ?? e);
    res.status(500).json({ error: (e as any)?.message ?? 'Error interno' });
  }
}