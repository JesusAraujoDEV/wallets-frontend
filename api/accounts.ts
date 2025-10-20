import { errorJson, json, getSql } from './_db.js';

export default async function handler(request: Request) {
  // Agregamos logs para ver qué pasa en la terminal de 'vercel dev'
  console.log(`[API] Recibida petición: ${request.method} ${request.url}`);

  try {
    const method = request.method.toUpperCase();
    const sql = getSql();

    // ---------------------------------------------------------------
    // 1. ¡QUITAMOS EL CREATE TABLE DE AQUÍ!
    // Tu tabla ya existe. Esto no debe estar en un handler de API,
    // sino en un script de migración. Este era el culpable del "cuelgue".
    // ---------------------------------------------------------------

    if (method === 'GET') {
      console.log('[API] Procesando GET...');
      
      const list = await sql`
        SELECT id, name, "type", currency, balance 
        FROM public.accounts 
        ORDER BY name ASC;
      `;
      console.log(`[API] GET exitoso. Encontrados ${list.length} registros.`);
      console.log('Lista original:', list); // Perfecto para debug

      // 1. Esta línea CONVIERTE el balance de string a número
      const safeList = list.map(account => ({
        ...account,
        balance: Number(account.balance) // '51.00' -> 51
      }));
      
      // 2. ¡ESTE ES EL ARREGLO!
      // Debes devolver la 'safeList' (la convertida)
      // Y DEBES envolverla en la función 'json()' para crear una respuesta HTTP.
      return json(safeList);
    }

    if (method === 'POST') {
      console.log('[API] Procesando POST (Crear)...');
      const body = await request.json();
      
      // 3. Ajustamos al schema real:
      //    - El 'id' no se pasa, es SERIAL (autoincremental).
      //    - 'type' es obligatorio y debe venir en el body.
      const { name, type, currency, balance } = body;

      if (!name || !type || !currency) {
        return errorJson('Faltan campos obligatorios: name, type, currency', 400);
      }

      // Usamos el balance del body, o 0 si no se proporciona
      const finalBalance = balance !== undefined ? balance : 0;

      const result = await sql`
        INSERT INTO public.accounts (name, "type", currency, balance) 
        VALUES (${name}, ${type}, ${currency}, ${finalBalance})
        RETURNING id;
      `;

      console.log(`[API] POST exitoso. Nuevo ID: ${result[0].id}`);
      return json({ ok: true, newId: result[0].id });
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
    // Si hay un error de SQL, lo veremos aquí
    console.error('[API] ¡Error en la base de datos!', e);
    return errorJson(e.message);
  }
}