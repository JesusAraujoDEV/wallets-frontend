import { errorJson, json, sql } from './_db.js';

export default async function handler(request: Request) {
  console.log(`[API] Recibida petición: ${request.method} ${request.url}`);

  try {
    const method = request.method.toUpperCase();

    if (method === 'GET') {
      console.log('[API] Procesando GET...');
      
      // La variable 'list' ahora es un objeto { rows: [...] }
      const list = await sql`
        SELECT id, name, "type", currency, balance 
        FROM public.accounts 
        ORDER BY name ASC;
      `;
      
      // ¡AQUÍ ESTÁ EL ARREGLO 2!
      // Usamos 'list.rows.length'
      console.log(`[API] GET exitoso. Encontrados ${list.rows.length} registros.`); // <-- CAMBIO
      // Usamos 'list.rows'
      console.log('Lista original:', list.rows); // <-- CAMBIO

      // Usamos 'list.rows.map'
      const safeList = list.rows.map(account => ({ // <-- CAMBIO
        ...account,
        balance: Number(account.balance)
      }));
      
      // Esto ya funcionará gracias al Arreglo 1
      return json(safeList);
    }

    if (method === 'POST') {
      console.log('[API] Procesando POST (Crear)...');
      const body = await request.json();
      
      const { name, type, currency, balance } = body;

      if (!name || !type || !currency) {
        return errorJson('Faltan campos obligatorios: name, type, currency', 400);
      }

      const finalBalance = balance !== undefined ? balance : 0;

      // Usamos 'list.rows[0].id'
      const result = await sql`
        INSERT INTO public.accounts (name, "type", currency, balance) 
        VALUES (${name}, ${type}, ${currency}, ${finalBalance})
        RETURNING id;
      `;

      console.log(`[API] POST exitoso. Nuevo ID: ${result.rows[0].id}`); // <-- CAMBIO
      return json({ ok: true, newId: result.rows[0].id });
    }

    if (method === 'PUT') {
      console.log('[API] Procesando PUT (Actualizar)...');
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');
      if (!id) return errorJson('Se requiere el "id" en la URL (query param) para actualizar', 400);

      const body = await request.json();
      const { name, type, currency, balance } = body;

      if (!name || !type || !currency || balance === undefined) {
        return errorJson('Se requieren todos los campos (name, type, currency, balance) para actualizar', 400);
      }

      await sql`
        UPDATE public.accounts 
        SET 
          name = ${name}, 
          "type" = ${type}, 
          currency = ${currency}, 
          balance = ${balance}, 
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${Number(id)};
      `;
      
      console.log(`[API] PUT exitoso. Actualizado ID: ${id}`);
      return json({ ok: true, message: 'Cuenta actualizada' });
    }

    if (method === 'DELETE') {
      console.log('[API] Procesando DELETE...');
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');
      if (!id) return errorJson('Se requiere el "id" en la URL (query param)', 400);
  
      await sql`DELETE FROM public.accounts WHERE id = ${Number(id)};`;
      
      console.log(`[API] DELETE exitoso. Borrado ID: ${id}`);
      return json({ ok: true });
    }

    return errorJson('Método no permitido', 405);
  } catch (e: any) {
    console.error('[API] ¡Error en la base de datos!', e);
    return errorJson(e.message);
  }
}