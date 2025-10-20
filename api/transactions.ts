// api/transactions.ts

import { errorJson, json, getSql } from './_db.js';

/** Helper para saber si sumar o restar del balance */
function getDelta(type: 'ingreso' | 'gasto', amount: number): number {
  // Aseguramos que amount sea un número
  const numAmount = Number(amount) || 0;
  return type === 'ingreso' ? numAmount : -numAmount;
}

export default async function handler(request: Request) {
  console.log(`[API] Recibida petición: ${request.method} ${request.url}`);
  const sql = getSql();

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
      console.log(`[API] GET /transactions exitoso. Encontrados ${list.length} registros.`);
      return json(list);
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
      const categoryResult = await sql`SELECT "type" FROM public.categories WHERE id = ${Number(categoryId)};`;
      if (categoryResult.length === 0) {
        throw new Error(`La categoría con id ${categoryId} no existe`);
      }
      const type = categoryResult[0].type as ('ingreso' | 'gasto');

      // B. Insertar la nueva transacción
      const insertResult = await sql`
        INSERT INTO public.transactions 
          (date, description, category_id, account_id, amount, currency, amount_usd, exchange_rate_used)
        VALUES 
          (${date}, ${description}, ${Number(categoryId)}, ${Number(accountId)}, ${Number(amount)}, ${currency}, ${amountUsd || null}, ${exchangeRateUsed || null})
        RETURNING id;
      `;
      const newTransactionId = insertResult[0].id;

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
      const oldTxResult = await sql`
        SELECT 
          t.account_id, 
          t.amount, 
          c."type"
        FROM public.transactions t
        JOIN public.categories c ON t.category_id = c.id
        WHERE t.id = ${numericId};
      `;
      
      const old = oldTxResult[0];

      // B. *** AQUÍ ESTÁ EL CAMBIO ***
      // Si no existe 'old', no hay nada que borrar ni revertir.
      if (!old) {
        console.log(`[API] DELETE: No se encontró ID ${numericId}`);
        return json({ ok: true, message: 'No se encontró la transacción' });
      }

      // C. Borrar la transacción
      // (Quitamos la variable 'deleteResult' que no usábamos)
      await sql`DELETE FROM public.transactions WHERE id = ${numericId};`;

      // D. Revertir el balance (sabemos que 'old' existe)
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