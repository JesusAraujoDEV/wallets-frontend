// api/transactions.ts

import { sql } from './_db.js';
import { requireUserId } from './_auth.js';

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

// Obtener tasa VES por USD por fecha (YYYY-MM-DD) desde la API pública
async function getVesPerUsdByDate(dateISO: string): Promise<number | null> {
  try {
    const target = (dateISO || '').slice(0, 10);
    if (!target) return null;
    // Fallback up to 7 days back (weekends/holidays)
    let d = new Date(target + 'T00:00:00Z');
    for (let i = 0; i <= 7; i++) {
      const iso = d.toISOString().slice(0, 10);
      const url = `https://api.dolarvzla.com/public/exchange-rate/list?from=${iso}&to=${iso}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        const item = json?.rates?.[0];
        const rate = item?.usd != null ? Number(item.usd) : null;
        if (rate && isFinite(rate)) return rate;
      }
      // step back one day
      d = new Date(d.getTime() - 24 * 60 * 60 * 1000);
    }
    return null;
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  console.log(`[API] Recibida petición: ${req.method} ${req.url}`);

  try {
    const method = (req.method || 'GET').toUpperCase();
    const userId = await requireUserId(req, res);
    if (!userId) return;

    if (method === 'GET') {
      console.log('[API] Procesando GET /transactions...');
  const { searchParams } = new URL(req.url, 'http://localhost');
  const grouped = searchParams.get('grouped');

  // Server-side filters
  const q = (searchParams.get('q') || '').trim() || null;
  const typeRaw = (searchParams.get('type') || '').trim().toLowerCase();
  const typeParam: 'ingreso' | 'gasto' | null = typeRaw === 'income' ? 'ingreso' : typeRaw === 'expense' ? 'gasto' : null;
  const categoryIdParam = (() => { const v = searchParams.get('categoryId'); const n = v ? Number(v) : NaN; return Number.isFinite(n) ? n : null;})();
  const accountIdParam = (() => { const v = searchParams.get('accountId'); const n = v ? Number(v) : NaN; return Number.isFinite(n) ? n : null;})();
  const dateParam = (() => { const v = (searchParams.get('date') || '').slice(0,10); return v ? v : null;})();
      if (grouped === '1' || grouped === 'true') {
        const pageSizeRaw = searchParams.get('pageSize');
        const cursorDate = searchParams.get('cursorDate'); // YYYY-MM-DD, exclusive (fetch strictly older days)
        const pageSize = Math.max(1, Math.min(200, Number(pageSizeRaw) || 20));

        // 1) Determine which days to include fully until cumulative count >= pageSize
        const daysSql = cursorDate
          ? sql`
            WITH days AS (
              SELECT t.date::date AS day, COUNT(*)::int AS cnt
              FROM public.transactions t
              JOIN public.categories c ON c.id = t.category_id AND c.user_id = ${userId}
              WHERE t.user_id = ${userId}
                AND t.date::date < ${cursorDate}
                AND (${accountIdParam}::int IS NULL OR t.account_id = ${accountIdParam})
                AND (${categoryIdParam}::int IS NULL OR t.category_id = ${categoryIdParam})
                AND (${typeParam}::text IS NULL OR c."type" = ${typeParam})
                AND (${dateParam}::date IS NULL OR t.date::date = ${dateParam})
                AND (${q}::text IS NULL OR (t.description ILIKE '%' || ${q} || '%' OR c.name ILIKE '%' || ${q} || '%'))
              GROUP BY t.date::date
            ), ordered AS (
              SELECT day, cnt, SUM(cnt) OVER (ORDER BY day DESC) AS cume
              FROM days
              ORDER BY day DESC
            ), threshold AS (
              SELECT MIN(day) AS last_day FROM ordered WHERE cume >= ${pageSize}
            )
            SELECT day FROM ordered WHERE cume <= ${pageSize}
            UNION
            SELECT last_day FROM threshold WHERE last_day IS NOT NULL
          `
          : sql`
            WITH days AS (
              SELECT t.date::date AS day, COUNT(*)::int AS cnt
              FROM public.transactions t
              JOIN public.categories c ON c.id = t.category_id AND c.user_id = ${userId}
              WHERE t.user_id = ${userId}
                AND (${accountIdParam}::int IS NULL OR t.account_id = ${accountIdParam})
                AND (${categoryIdParam}::int IS NULL OR t.category_id = ${categoryIdParam})
                AND (${typeParam}::text IS NULL OR c."type" = ${typeParam})
                AND (${dateParam}::date IS NULL OR t.date::date = ${dateParam})
                AND (${q}::text IS NULL OR (t.description ILIKE '%' || ${q} || '%' OR c.name ILIKE '%' || ${q} || '%'))
              GROUP BY t.date::date
            ), ordered AS (
              SELECT day, cnt, SUM(cnt) OVER (ORDER BY day DESC) AS cume
              FROM days
              ORDER BY day DESC
            ), threshold AS (
              SELECT MIN(day) AS last_day FROM ordered WHERE cume >= ${pageSize}
            )
            SELECT day FROM ordered WHERE cume <= ${pageSize}
            UNION
            SELECT last_day FROM threshold WHERE last_day IS NOT NULL
          `;

        // We’ll reuse the computed CTE in a single query to avoid array param issues
        const list = cursorDate
          ? await sql`
            WITH days AS (
              SELECT t.date::date AS day, COUNT(*)::int AS cnt
              FROM public.transactions t
              JOIN public.categories c ON c.id = t.category_id AND c.user_id = ${userId}
              WHERE t.user_id = ${userId}
                AND t.date::date < ${cursorDate}
                AND (${accountIdParam}::int IS NULL OR t.account_id = ${accountIdParam})
                AND (${categoryIdParam}::int IS NULL OR t.category_id = ${categoryIdParam})
                AND (${typeParam}::text IS NULL OR c."type" = ${typeParam})
                AND (${dateParam}::date IS NULL OR t.date::date = ${dateParam})
                AND (${q}::text IS NULL OR (t.description ILIKE '%' || ${q} || '%' OR c.name ILIKE '%' || ${q} || '%'))
              GROUP BY t.date::date
            ), ordered AS (
              SELECT day, cnt, SUM(cnt) OVER (ORDER BY day DESC) AS cume
              FROM days
              ORDER BY day DESC
            ), threshold AS (
              SELECT MIN(day) AS last_day FROM ordered WHERE cume >= ${pageSize}
            ), selected_days AS (
              SELECT day FROM ordered WHERE cume <= ${pageSize}
              UNION
              SELECT last_day FROM threshold WHERE last_day IS NOT NULL
            )
            SELECT 
              t.id, 
              t.date, 
              t.description, 
              t.category_id AS "categoryId", 
              t.account_id AS "accountId", 
              t.amount,
              t.currency,
              t.amount_usd AS "amountUsd",
              t.exchange_rate_used AS "exchangeRateUsed",
              c."type" AS "categoryType"
            FROM public.transactions t
            JOIN public.categories c ON c.id = t.category_id AND c.user_id = ${userId}
            WHERE t.user_id = ${userId}
              AND t.date::date IN (SELECT day FROM selected_days)
              AND (${accountIdParam}::int IS NULL OR t.account_id = ${accountIdParam})
              AND (${categoryIdParam}::int IS NULL OR t.category_id = ${categoryIdParam})
              AND (${typeParam}::text IS NULL OR c."type" = ${typeParam})
              AND (${dateParam}::date IS NULL OR t.date::date = ${dateParam})
              AND (${q}::text IS NULL OR (t.description ILIKE '%' || ${q} || '%' OR c.name ILIKE '%' || ${q} || '%'))
            ORDER BY t.date DESC, t.id DESC;
          `
          : await sql`
            WITH days AS (
              SELECT t.date::date AS day, COUNT(*)::int AS cnt
              FROM public.transactions t
              JOIN public.categories c ON c.id = t.category_id AND c.user_id = ${userId}
              WHERE t.user_id = ${userId}
                AND (${accountIdParam}::int IS NULL OR t.account_id = ${accountIdParam})
                AND (${categoryIdParam}::int IS NULL OR t.category_id = ${categoryIdParam})
                AND (${typeParam}::text IS NULL OR c."type" = ${typeParam})
                AND (${dateParam}::date IS NULL OR t.date::date = ${dateParam})
                AND (${q}::text IS NULL OR (t.description ILIKE '%' || ${q} || '%' OR c.name ILIKE '%' || ${q} || '%'))
              GROUP BY t.date::date
            ), ordered AS (
              SELECT day, cnt, SUM(cnt) OVER (ORDER BY day DESC) AS cume
              FROM days
              ORDER BY day DESC
            ), threshold AS (
              SELECT MIN(day) AS last_day FROM ordered WHERE cume >= ${pageSize}
            ), selected_days AS (
              SELECT day FROM ordered WHERE cume <= ${pageSize}
              UNION
              SELECT last_day FROM threshold WHERE last_day IS NOT NULL
            )
            SELECT 
              t.id, 
              t.date, 
              t.description, 
              t.category_id AS "categoryId", 
              t.account_id AS "accountId", 
              t.amount,
              t.currency,
              t.amount_usd AS "amountUsd",
              t.exchange_rate_used AS "exchangeRateUsed",
              c."type" AS "categoryType"
            FROM public.transactions t
            JOIN public.categories c ON c.id = t.category_id AND c.user_id = ${userId}
            WHERE t.user_id = ${userId}
              AND t.date::date IN (SELECT day FROM selected_days)
              AND (${accountIdParam}::int IS NULL OR t.account_id = ${accountIdParam})
              AND (${categoryIdParam}::int IS NULL OR t.category_id = ${categoryIdParam})
              AND (${typeParam}::text IS NULL OR c."type" = ${typeParam})
              AND (${dateParam}::date IS NULL OR t.date::date = ${dateParam})
              AND (${q}::text IS NULL OR (t.description ILIKE '%' || ${q} || '%' OR c.name ILIKE '%' || ${q} || '%'))
            ORDER BY t.date DESC, t.id DESC;
          `;

        const safeItems = list.rows.map((tx) => ({
          id: String(tx.id),
          date: tx.date,
          description: tx.description,
          categoryId: String(tx.categoryId),
          accountId: String(tx.accountId),
          amount: Number(tx.amount),
          type: tx.categoryType === 'ingreso' ? 'income' : 'expense',
          currency: tx.currency,
          amountUsd: tx.amountUsd ? Number(tx.amountUsd) : null,
          exchangeRateUsed: tx.exchangeRateUsed ? Number(tx.exchangeRateUsed) : null,
        }));

        // 3) Compute next cursor and hasMore: ask for the oldest day included from the selected_days CTE
        const oldestRes = cursorDate
          ? await sql`
            WITH days AS (
              SELECT t.date::date AS day, COUNT(*)::int AS cnt
              FROM public.transactions t
              JOIN public.categories c ON c.id = t.category_id AND c.user_id = ${userId}
              WHERE t.user_id = ${userId} AND t.date::date < ${cursorDate}
              GROUP BY t.date::date
            ), ordered AS (
              SELECT day, cnt, SUM(cnt) OVER (ORDER BY day DESC) AS cume
              FROM days
              ORDER BY day DESC
            ), threshold AS (
              SELECT MIN(day) AS last_day FROM ordered WHERE cume >= ${pageSize}
            ), selected_days AS (
              SELECT day FROM ordered WHERE cume <= ${pageSize}
              UNION
              SELECT last_day FROM threshold WHERE last_day IS NOT NULL
            )
            SELECT MIN(day) AS oldest FROM selected_days;
          `
          : await sql`
            WITH days AS (
              SELECT t.date::date AS day, COUNT(*)::int AS cnt
              FROM public.transactions t
              JOIN public.categories c ON c.id = t.category_id AND c.user_id = ${userId}
              WHERE t.user_id = ${userId}
              GROUP BY t.date::date
            ), ordered AS (
              SELECT day, cnt, SUM(cnt) OVER (ORDER BY day DESC) AS cume
              FROM days
              ORDER BY day DESC
            ), threshold AS (
              SELECT MIN(day) AS last_day FROM ordered WHERE cume >= ${pageSize}
            ), selected_days AS (
              SELECT day FROM ordered WHERE cume <= ${pageSize}
              UNION
              SELECT last_day FROM threshold WHERE last_day IS NOT NULL
            )
            SELECT MIN(day) AS oldest FROM selected_days;
          `;
        const oldestDayIncluded: string | null = oldestRes.rows?.[0]?.oldest ? String(oldestRes.rows[0].oldest) : null;
        if (!oldestDayIncluded) {
          return res.status(200).json({ items: safeItems, hasMore: false, nextCursorDate: null });
        }
        const moreRes = await sql`
          SELECT 1 FROM public.transactions t
          JOIN public.categories c ON c.id = t.category_id AND c.user_id = ${userId}
          WHERE t.user_id = ${userId}
            AND t.date::date < ${oldestDayIncluded}
            AND (${accountIdParam}::int IS NULL OR t.account_id = ${accountIdParam})
            AND (${categoryIdParam}::int IS NULL OR t.category_id = ${categoryIdParam})
            AND (${typeParam}::text IS NULL OR c."type" = ${typeParam})
            AND (${dateParam}::date IS NULL OR t.date::date = ${dateParam})
            AND (${q}::text IS NULL OR (t.description ILIKE '%' || ${q} || '%' OR c.name ILIKE '%' || ${q} || '%'))
          LIMIT 1;
        `;
        const hasMore = moreRes.rows.length > 0;
        const nextCursorDate = hasMore ? oldestDayIncluded : null;
        console.log(`[API] GET /transactions (grouped) items=${safeItems.length} hasMore=${hasMore}`);
        return res.status(200).json({ items: safeItems, hasMore, nextCursorDate });
      }

      // Default: return full list (legacy behavior)
      const list = await sql`
        SELECT 
          t.id, 
          t.date, 
          t.description, 
          t.category_id AS "categoryId", 
          t.account_id AS "accountId", 
          t.amount,
          t.currency,
          t.amount_usd AS "amountUsd",
          t.exchange_rate_used AS "exchangeRateUsed",
          c."type" AS "categoryType"
        FROM public.transactions t
        JOIN public.categories c ON c.id = t.category_id AND c.user_id = ${userId}
        WHERE t.user_id = ${userId}
          AND (${accountIdParam}::int IS NULL OR t.account_id = ${accountIdParam})
          AND (${categoryIdParam}::int IS NULL OR t.category_id = ${categoryIdParam})
          AND (${typeParam}::text IS NULL OR c."type" = ${typeParam})
          AND (${dateParam}::date IS NULL OR t.date::date = ${dateParam})
          AND (${q}::text IS NULL OR (t.description ILIKE '%' || ${q} || '%' OR c.name ILIKE '%' || ${q} || '%'))
        ORDER BY t.date DESC, t.id DESC;
      `;
      console.log(`[API] GET /transactions exitoso. Encontrados ${list.rows.length} registros.`);

      const safeList = list.rows.map((tx) => ({
        id: String(tx.id),
        date: tx.date,
        description: tx.description,
        categoryId: String(tx.categoryId),
        accountId: String(tx.accountId),
        amount: Number(tx.amount),
        type: tx.categoryType === 'ingreso' ? 'income' : 'expense',
        currency: tx.currency,
        amountUsd: tx.amountUsd ? Number(tx.amountUsd) : null,
        exchangeRateUsed: tx.exchangeRateUsed ? Number(tx.exchangeRateUsed) : null,
      }));

      res.status(200).json(safeList);
      return;
    }

    if (method === 'PUT') {
      console.log('[API] Procesando PUT /transactions (Actualizar)...');
      const { searchParams } = new URL(req.url, 'http://localhost');
      const id = searchParams.get('id');
      if (!id) {
        res.status(400).json({ error: 'Se requiere "id" en URL para actualizar' });
        return;
      }

      const numericId = Number(id);
      if (isNaN(numericId)) {
        res.status(400).json({ error: '"id" debe ser un número' });
        return;
      }

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
      } = body || {};

      if (!date || !description || !categoryId || !accountId || amount === undefined || !currency) {
        res.status(400).json({ error: 'Campos requeridos: date, description, categoryId, accountId, amount, currency' });
        return;
      }

      // Fetch existing tx and its category type
      const prevTxResult = await sql`
        SELECT t.account_id, t.amount, c."type" AS prev_type
        FROM public.transactions t
        JOIN public.categories c ON t.category_id = c.id AND c.user_id = ${userId}
        WHERE t.id = ${numericId} AND t.user_id = ${userId};
      `;
      if (prevTxResult.rows.length === 0) {
        res.status(404).json({ error: 'Transacción no encontrada' });
        return;
      }
      const prev = prevTxResult.rows[0] as { account_id: number; amount: number; prev_type: 'ingreso' | 'gasto' };

      // Validate new category and account
      const categoryResult = await sql`SELECT "type" FROM public.categories WHERE id = ${Number(categoryId)} AND user_id = ${userId};`;
      if (categoryResult.rows.length === 0) {
        res.status(400).json({ error: `La categoría con id ${categoryId} no existe` });
        return;
      }
      const newType = categoryResult.rows[0].type as 'ingreso' | 'gasto';
      const accountCheck = await sql`SELECT id FROM public.accounts WHERE id = ${Number(accountId)} AND user_id = ${userId};`;
      if (accountCheck.rows.length === 0) {
        res.status(400).json({ error: `La cuenta con id ${accountId} no existe` });
        return;
      }

      // Calcular equivalencia a USD
      let finalAmountUsd: number | null = null;
      let finalRateUsed: number | null = null;
      if (currency === 'VES') {
        // Always recompute from authoritative historical rate; ignore client-provided values
        const rate = await getVesPerUsdByDate(String(date));
        if (rate) {
          finalRateUsed = rate;
          const usd = Number(amount) / rate;
          finalAmountUsd = Number(usd.toFixed(2));
        } else {
          finalAmountUsd = null;
          finalRateUsed = null;
        }
      } else if (currency === 'USD') {
        finalAmountUsd = Number(amount);
        finalRateUsed = null;
      }

      // Revert prev balance then apply new (could be different account)
      const revert = getDelta(prev.prev_type, Number(prev.amount)) * -1;
      await sql`UPDATE public.accounts SET balance = ROUND(COALESCE(balance,0) + ${revert}, 2) WHERE id = ${prev.account_id} AND user_id = ${userId};`;
      const apply = getDelta(newType, Number(amount));
      await sql`UPDATE public.accounts SET balance = ROUND(COALESCE(balance,0) + ${apply}, 2) WHERE id = ${Number(accountId)} AND user_id = ${userId};`;

      // Update transaction row
      await sql`
        UPDATE public.transactions
        SET 
          date = ${date},
          description = ${description},
          category_id = ${Number(categoryId)},
          account_id = ${Number(accountId)},
          amount = ${Number(amount)},
          currency = ${currency},
          amount_usd = ${finalAmountUsd},
          exchange_rate_used = ${finalRateUsed}
        WHERE id = ${numericId} AND user_id = ${userId};
      `;

      // Return updated transaction with computed USD equivalence and type
      const updated = await sql`
        SELECT 
          t.id, 
          t.date, 
          t.description, 
          t.category_id AS "categoryId", 
          t.account_id AS "accountId", 
          t.amount,
          t.currency,
          t.amount_usd AS "amountUsd",
          t.exchange_rate_used AS "exchangeRateUsed",
          c."type" AS "categoryType"
        FROM public.transactions t
        JOIN public.categories c ON c.id = t.category_id AND c.user_id = ${userId}
        WHERE t.id = ${numericId} AND t.user_id = ${userId}
        LIMIT 1;
      `;

      const row = updated.rows[0];
      const safe = row ? {
        id: String(row.id),
        date: row.date,
        description: row.description,
        categoryId: String(row.categoryId),
        accountId: String(row.accountId),
        amount: Number(row.amount),
        type: row.categoryType === 'ingreso' ? 'income' : 'expense',
        currency: row.currency,
        amountUsd: row.amountUsd != null ? Number(row.amountUsd) : null,
        exchangeRateUsed: row.exchangeRateUsed != null ? Number(row.exchangeRateUsed) : null,
      } : null;

      console.log(`[API] PUT /transactions exitoso. Actualizado ID: ${id}`);
      res.status(200).json({ ok: true, tx: safe, message: 'Transacción actualizada' });
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
      } = body;

      if (!date || !description || !categoryId || !accountId || amount === undefined || !currency) {
        res.status(400).json({ error: 'Campos requeridos: date, description, categoryId, accountId, amount, currency' });
        return;
      }

      // Validate ownership of category and account
      const categoryResult = await sql`SELECT "type" FROM public.categories WHERE id = ${Number(categoryId)} AND user_id = ${userId};`;
      if (categoryResult.rows.length === 0) {
        res.status(400).json({ error: `La categoría con id ${categoryId} no existe` });
        return;
      }
      const type = categoryResult.rows[0].type as 'ingreso' | 'gasto';
      const accountCheck = await sql`SELECT id FROM public.accounts WHERE id = ${Number(accountId)} AND user_id = ${userId};`;
      if (accountCheck.rows.length === 0) {
        res.status(400).json({ error: `La cuenta con id ${accountId} no existe` });
        return;
      }

      // Calcular equivalencia a USD si la moneda es VES (Bs.)
      let finalAmountUsd: number | null = null;
      let finalRateUsed: number | null = null;
      if (currency === 'VES') {
        // Always compute from historical rate for the given date (authoritative)
        const rate = await getVesPerUsdByDate(String(date));
        if (rate) {
          finalRateUsed = rate; // VES per USD
          const usd = Number(amount) / rate;
          finalAmountUsd = Number(usd.toFixed(2));
        } else {
          finalAmountUsd = null;
          finalRateUsed = null;
        }
      } else if (currency === 'USD') {
        // Para USD guardamos el monto tal cual en amount_usd
        finalAmountUsd = Number(amount);
        finalRateUsed = null;
      }

      const insertResult = await sql`
        INSERT INTO public.transactions 
          (date, description, category_id, account_id, amount, currency, amount_usd, exchange_rate_used, user_id)
        VALUES 
          (${date}, ${description}, ${Number(categoryId)}, ${Number(accountId)}, ${Number(amount)}, ${currency}, ${finalAmountUsd}, ${finalRateUsed}, ${userId})
        RETURNING id;
      `;
      const newTransactionId = insertResult.rows[0].id;

      const delta = getDelta(type, Number(amount));
      await sql`
        UPDATE public.accounts 
        SET balance = ROUND(COALESCE(balance,0) + ${delta}, 2) 
        WHERE id = ${Number(accountId)} AND user_id = ${userId};
      `;

      // Return the created transaction row with computed USD equivalence for client consistency
      const createdRow = await sql`
        SELECT 
          t.id, 
          t.date, 
          t.description, 
          t.category_id AS "categoryId", 
          t.account_id AS "accountId", 
          t.amount,
          t.currency,
          t.amount_usd AS "amountUsd",
          t.exchange_rate_used AS "exchangeRateUsed",
          c."type" AS "categoryType"
        FROM public.transactions t
        JOIN public.categories c ON c.id = t.category_id AND c.user_id = ${userId}
        WHERE t.id = ${newTransactionId} AND t.user_id = ${userId}
        LIMIT 1;
      `;

      const row = createdRow.rows[0];
      const safe = row ? {
        id: String(row.id),
        date: row.date,
        description: row.description,
        categoryId: String(row.categoryId),
        accountId: String(row.accountId),
        amount: Number(row.amount),
        type: row.categoryType === 'ingreso' ? 'income' : 'expense',
        currency: row.currency,
        amountUsd: row.amountUsd != null ? Number(row.amountUsd) : null,
        exchangeRateUsed: row.exchangeRateUsed != null ? Number(row.exchangeRateUsed) : null,
      } : null;

      console.log(`[API] POST /transactions exitoso. Nuevo ID: ${newTransactionId}`);
      res.status(200).json({ ok: true, newId: String(newTransactionId), tx: safe });
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
        JOIN public.categories c ON t.category_id = c.id AND c.user_id = ${userId}
        WHERE t.id = ${numericId} AND t.user_id = ${userId};
      `;

      const old = oldTxResult.rows[0];
      if (!old) {
        console.log(`[API] DELETE: No se encontró ID ${numericId}`);
        res.status(200).json({ ok: true, message: 'No se encontró la transacción' });
        return;
      }

  await sql`DELETE FROM public.transactions WHERE id = ${numericId} AND user_id = ${userId};`;

      const revertAmount = getDelta(old.type as 'ingreso' | 'gasto', old.amount) * -1;
      await sql`
        UPDATE public.accounts 
        SET balance = ROUND(COALESCE(balance,0) + ${revertAmount}, 2) 
        WHERE id = ${old.account_id} AND user_id = ${userId};
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