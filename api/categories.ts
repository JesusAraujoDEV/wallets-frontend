// api/categories.ts

// 1. La importación ya está correcta (trae 'sql' y usa '.js')
import { errorJson, json, sql } from './_db.js';

export default async function handler(request: Request) {
  console.log(`[API] Recibida petición: ${request.method} ${request.url}`);
  try {
    const method = request.method.toUpperCase();

    // 2. BORRAMOS esta línea
    // const sql = getSql(); 

    // 1. ELIMINADO EL 'CREATE TABLE'
    // Tu tabla ya existe y esto causaba el cuelgue.

    if (method === 'GET') {
      console.log('[API] Procesando GET /categories...');
      // 2. Corregido el SELECT (sin color, "type" entre comillas)
      const list = await sql`
        SELECT id, name, "type" 
        FROM public.categories 
        ORDER BY name ASC;
      `;
      // 3. Usamos list.rows
      console.log(`[API] GET /categories exitoso. Encontrados ${list.rows.length} registros.`);
      return json(list.rows); // <-- CAMBIO
    }

    if (method === 'POST') {
      console.log('[API] Procesando POST /categories (Crear)...');
      const body = await request.json();
      
      // 3. Ajustado al schema real (id es serial, no 'color', "type" es 'ingreso'/'gasto')
      const { name, type } = body; // 'type' debe ser 'ingreso' o 'gasto'

      if (!name || !type) {
        return errorJson('Faltan campos: name, type', 400);
      }
      if (type !== 'ingreso' && type !== 'gasto') {
        return errorJson("El tipo debe ser 'ingreso' o 'gasto'", 400);
      }

      const result = await sql`
        INSERT INTO public.categories (name, "type") 
        VALUES (${name}, ${type})
        RETURNING id;
      `;
      // 3. Usamos result.rows
      console.log(`[API] POST /categories exitoso. Nuevo ID: ${result.rows[0].id}`); // <-- CAMBIO
      return json({ ok: true, newId: result.rows[0].id }); // <-- CAMBIO
    }

    if (method === 'PUT') {
      // 4. Añadido un PUT para actualizar (el POST del template era un "upsert" que no funciona con IDs serial)
      console.log('[API] Procesando PUT /categories (Actualizar)...');
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');
      if (!id) return errorJson('Se requiere "id" en URL para actualizar', 400);

      const body = await request.json();
      const { name, type } = body;

      if (!name || !type) return errorJson('Faltan campos: name, type', 400);
      if (type !== 'ingreso' && type !== 'gasto') return errorJson("El tipo debe ser 'ingreso' o 'gasto'", 400);
      
      await sql`
        UPDATE public.categories 
        SET 
          name = ${name}, 
          "type" = ${type},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${Number(id)};
      `;
      console.log(`[API] PUT /categories exitoso. Actualizado ID: ${id}`);
      return json({ ok: true, message: 'Categoría actualizada' });
    }

    if (method === 'DELETE') {
      console.log('[API] Procesando DELETE /categories...');
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');
      if (!id) return errorJson('Se requiere "id" en URL', 400);
  
      await sql`DELETE FROM public.categories WHERE id = ${Number(id)};`;
      console.log(`[API] DELETE /categories exitoso. Borrado ID: ${id}`);
      return json({ ok: true });
    }

    return errorJson('Método no permitido', 405);
  } catch (e: any) {
    console.error('[API] ¡Error en /categories!', e);
    return errorJson(e.message);
  }
}