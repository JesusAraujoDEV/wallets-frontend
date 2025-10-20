// api/categories.ts

import { sql } from './_db.js';

export default async function handler(req, res) {
  console.log(`[API] Recibida petición: ${req.method} ${req.url}`);
  try {
    const method = (req.method || 'GET').toUpperCase();

    if (method === 'GET') {
      console.log('[API] Procesando GET /categories...');
      const list = await sql`
        SELECT id, name, "type" 
        FROM public.categories 
        ORDER BY name ASC;
      `;
      console.log(`[API] GET /categories exitoso. Encontrados ${list.rows.length} registros.`);
      res.status(200).json(list.rows);
      return;
    }

    if (method === 'POST') {
      console.log('[API] Procesando POST /categories (Crear)...');
      const body = req.body ?? {};
      const { name, type } = body; // 'type' debe ser 'ingreso' o 'gasto'

      if (!name || !type) {
        res.status(400).json({ error: 'Faltan campos: name, type' });
        return;
      }
      if (type !== 'ingreso' && type !== 'gasto') {
        res.status(400).json({ error: "El tipo debe ser 'ingreso' o 'gasto'" });
        return;
      }

      const result = await sql`
        INSERT INTO public.categories (name, "type") 
        VALUES (${name}, ${type})
        RETURNING id;
      `;
      console.log(`[API] POST /categories exitoso. Nuevo ID: ${result.rows[0].id}`);
      res.status(200).json({ ok: true, newId: result.rows[0].id });
      return;
    }

    if (method === 'PUT') {
      console.log('[API] Procesando PUT /categories (Actualizar)...');
      const { searchParams } = new URL(req.url, 'http://localhost');
      const id = searchParams.get('id');
      if (!id) {
        res.status(400).json({ error: 'Se requiere "id" en URL para actualizar' });
        return;
      }

      const body = req.body ?? {};
      const { name, type } = body;

      if (!name || !type) {
        res.status(400).json({ error: 'Faltan campos: name, type' });
        return;
      }
      if (type !== 'ingreso' && type !== 'gasto') {
        res.status(400).json({ error: "El tipo debe ser 'ingreso' o 'gasto'" });
        return;
      }
      
      await sql`
        UPDATE public.categories 
        SET 
          name = ${name}, 
          "type" = ${type},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${Number(id)};
      `;
      console.log(`[API] PUT /categories exitoso. Actualizado ID: ${id}`);
      res.status(200).json({ ok: true, message: 'Categoría actualizada' });
      return;
    }

    if (method === 'DELETE') {
      console.log('[API] Procesando DELETE /categories...');
      const { searchParams } = new URL(req.url, 'http://localhost');
      const id = searchParams.get('id');
      if (!id) {
        res.status(400).json({ error: 'Se requiere "id" en URL' });
           return;
      }
  
      await sql`DELETE FROM public.categories WHERE id = ${Number(id)};`;
      console.log(`[API] DELETE /categories exitoso. Borrado ID: ${id}`);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'Método no permitido' });
  } catch (e) {
    console.error('[API] ¡Error en /categories!', e);
    res.status(500).json({ error: (e as any)?.message ?? 'Error interno' });
  }
}