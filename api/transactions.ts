// api/transactions.ts

// 1. Cambiamos 'getSql' por 'sql'
import { errorJson, json, sql } from './_db.js';

/** Helper para saber si sumar o restar del balance */
function getDelta(type: 'ingreso' | 'gasto', amount: number | string): number { // Aceptamos string también
  // Aseguramos que amount sea un número
  const numAmount = Number(amount) || 0;
  return type === 'ingreso' ? numAmount : -numAmount;
}

export default async function handler(request: Request) {
  console.log(`[API] Recibida petición: ${request.method} ${request.url}`);
  
  // 2. BORRAMOS la línea 'const sql = getSql();'

  try {
    const method = request.method.toUpperCase();
    
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
      // 3. Usamos list.rows
      console.log(`[API] GET /transactions exitoso. Encontrados ${list.rows.length} registros.`);
      
      // 4. Convertimos los campos 'numeric' a Number para evitar problemas con JSON
      const safeList = list.rows.map(tx => ({
        ...tx,
        amount: Number(tx.amount),
        amountUsd: tx.amountUsd ? Number(tx.amountUsd) : null,
        exchangeRateUsed: tx.exchangeRateUsed ? Number(tx.exchangeRateUsed) : null,
      }));

      return json(safeList);
    }

    if (method === 'POST') {
      console.log('[API] Procesando POST /transactions (Crear)...');
      const body = await request.json();
      
      const {
        date,
        description,
        categoryId, // number
        accountId,  // number
        amount,     // number
        currency,   // string
        amountUsd,  // number (opcional)
        exchangeRateUsed // number (opcional)
      } = body;

      if (!date || !description || !categoryId || !accountId || amount === undefined || !currency) {
        return errorJson('Campos requeridos: date, description, categoryId, accountId, amount, currency', 400);
      }

      // A. Obtener el tipo ('ingreso' o 'gasto') de la categoría
      // 3. Usamos categoryResult.rows
      const categoryResult = await sql`SELECT "type" FROM public.categories WHERE id = ${Number(categoryId)};`;
      if (categoryResult.rows.length === 0) { // <-- CAMBIO
        throw new Error(`La categoría con id ${categoryId} no existe`);
      }
      const type = categoryResult.rows[0].type as ('ingreso' | 'gasto'); // <-- CAMBIO

      // B. Insertar la nueva transacción
      // 3. Usamos insertResult.rows
      const insertResult = await sql`
        INSERT INTO public.transactions 
          (date, description, category_id, account_id, amount, currency, amount_usd, exchange_rate_used)
        VALUES 
          (${date}, ${description}, ${Number(categoryId)}, ${Number(accountId)}, ${Number(amount)}, ${currency}, ${amountUsd || null}, ${exchangeRateUsed || null})
        RETURNING id;
      `;
      const newTransactionId = insertResult.rows[0].id; // <-- CAMBIO

      // C. Actualizar el balance de la cuenta
      const delta = getDelta(type, Number(amount));
      await sql`
        UPDATE public.accounts 
        SET balance = ROUND(COALESCE(balance,0) + ${delta}, 2) 
        WHERE id = ${Number(accountId)};
      `;

      console.log(`[API] POST /transactions exitoso. Nuevo ID: ${newTransactionId!}`);
      return json({ ok: true, newId: newTransactionId! });
    }

    if (method === 'DELETE') {
      console.log('[API] Procesando DELETE /transactions...');
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');
      if (!id) return errorJson('Se requiere "id" en URL', 400);
      
      const numericId = Number(id);
      if (isNaN(numericId)) return errorJson('"id" debe ser un número', 400);

      // A. Buscar la transacción y el TIPO de su categoría
      // 3. Usamos oldTxResult.rows
      const oldTxResult = await sql`
        SELECT 
          t.account_id, 
          t.amount, 
          c."type"
        FROM public.transactions t
        JOIN public.categories c ON t.category_id = c.id
        WHERE t.id = ${numericId};
      `;
      
      const old = oldTxResult.rows[0]; // <-- CAMBIO

      // B. Si no existe 'old', no hay nada que borrar ni revertir.
      if (!old) {
        console.log(`[API] DELETE: No se encontró ID ${numericId}`);
        return json({ ok: true, message: 'No se encontró la transacción' });
      }

      // C. Borrar la transacción
      await sql`DELETE FROM public.transactions WHERE id = ${numericId};`;

      // D. Revertir el balance (sabemos que 'old' existe)
      // 'old.amount' será un string, pero 'getDelta' lo maneja
      const revertAmount = getDelta(old.type as 'ingreso' | 'gasto', old.amount) * -1; // Invertir el delta
      await sql`
        UPDATE public.accounts 
        SET balance = ROUND(COALESCE(balance,0) + ${revertAmount}, 2) 
        WHERE id = ${old.account_id};
      `;

      console.log(`[API] DELETE /transactions exitoso. Borrado ID: ${id}`);
      return json({ ok: true });
    }

    return errorJson('Método no permitido', 405);
  } catch (e: any) {
    // Si hay un error de SQL, lo veremos aquí
    console.error(`[API] ¡Error en /transactions!`, e.message);
    return errorJson(e.message);
  }
}