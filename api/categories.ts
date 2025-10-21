// api/categories.ts

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

export default async function handler(req, res) {
  console.log(`[API] Recibida petición: ${req.method} ${req.url}`);
  try {
    const method = (req.method || 'GET').toUpperCase();
    const userId = await requireUserId(req, res);
    if (!userId) return;

    if (method === 'GET') {
      console.log('[API] Procesando GET /categories...');
      const list = await sql`
        SELECT id, name, "type" 
        FROM public.categories 
        WHERE user_id = ${userId}
        ORDER BY name ASC;
      `;
      console.log(`[API] GET /categories exitoso. Encontrados ${list.rows.length} registros.`);
      const safeList = list.rows.map((c: any) => ({
        id: String(c.id),
        name: c.name,
        type: c.type === 'ingreso' ? 'income' : 'expense',
        // UI expects color fields; provide defaults if DB doesn't have them
        color: 'hsl(var(--chart-6))',
        colorName: 'Pastel Blue',
      }));
      res.status(200).json(safeList);
      return;
    }

    if (method === 'POST') {
      console.log('[API] Procesando POST /categories (Crear)...');
      const body = await readJsonBody(req);
      // Frontend uses 'income' | 'expense'. Map to DB values 'ingreso' | 'gasto'
      const { name, type } = body || {};
      const dbType = type === 'income' ? 'ingreso' : type === 'expense' ? 'gasto' : type;

      if (!name || !dbType) {
        res.status(400).json({ error: 'Faltan campos: name, type' });
        return;
      }
      if (dbType !== 'ingreso' && dbType !== 'gasto') {
        res.status(400).json({ error: "El tipo debe ser 'ingreso' o 'gasto'" });
        return;
      }

      const result = await sql`
        INSERT INTO public.categories (name, "type", user_id) 
        VALUES (${name}, ${dbType}, ${userId})
        RETURNING id;
      `;
      const newId = String(result.rows[0].id);
      console.log(`[API] POST /categories exitoso. Nuevo ID: ${newId}`);
      res.status(200).json({ ok: true, newId });
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

      const body = await readJsonBody(req);
      const { name, type } = body || {};
      const dbType = type === 'income' ? 'ingreso' : type === 'expense' ? 'gasto' : type;

      if (!name || !dbType) {
        res.status(400).json({ error: 'Faltan campos: name, type' });
        return;
      }
      if (dbType !== 'ingreso' && dbType !== 'gasto') {
        res.status(400).json({ error: "El tipo debe ser 'ingreso' o 'gasto'" });
        return;
      }
      
      await sql`
        UPDATE public.categories 
        SET 
          name = ${name}, 
          "type" = ${dbType},
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ${Number(id)} AND user_id = ${userId};
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
  
  await sql`DELETE FROM public.categories WHERE id = ${Number(id)} AND user_id = ${userId};`;
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