import { sql } from './_db.js';

export default async function handler(req, res) {
  console.log(`[API] Recibida petición: ${req.method} ${req.url}`);

  try {
    const method = (req.method || 'GET').toUpperCase();

    if (method === 'GET') {
      console.log('[API] Procesando GET...');

      const list = await sql`
        SELECT id, name, "type", currency, balance
        FROM public.accounts
        ORDER BY name ASC;
      `;

      console.log(`[API] GET exitoso. Encontrados ${list.rows.length} registros.`);
      console.log('Lista original:', list.rows);

      const safeList = list.rows.map((account) => ({
        ...account,
        balance: Number(account.balance),
      }));

      res.status(200).json(safeList);
      return;
    }

    if (method === 'POST') {
      console.log('[API] Procesando POST (Crear)...');
      const body = req.body ?? {};
      const { name, type, currency, balance } = body;

      if (!name || !type || !currency) {
        res.status(400).json({ error: 'Faltan campos obligatorios: name, type, currency' });
        return;
      }

      const finalBalance = balance !== undefined ? balance : 0;

      const result = await sql`
        INSERT INTO public.accounts (name, "type", currency, balance)
        VALUES (${name}, ${type}, ${currency}, ${finalBalance})
        RETURNING id;
      `;

      console.log(`[API] POST exitoso. Nuevo ID: ${result.rows[0].id}`);
      res.status(200).json({ ok: true, newId: result.rows[0].id });
      return;
    }

    if (method === 'PUT') {
      console.log('[API] Procesando PUT (Actualizar)...');
      const { searchParams } = new URL(req.url, 'http://localhost');
      const id = searchParams.get('id');
      if (!id) {
        res.status(400).json({ error: 'Se requiere el "id" en la URL (query param) para actualizar' });
        return;
      }

      const body = req.body ?? {};
      const { name, type, currency, balance } = body;

      if (!name || !type || !currency || balance === undefined) {
        res.status(400).json({ error: 'Se requieren todos los campos (name, type, currency, balance) para actualizar' });
        return;
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
      res.status(200).json({ ok: true, message: 'Cuenta actualizada' });
      return;
    }

    if (method === 'DELETE') {
      console.log('[API] Procesando DELETE...');
      const { searchParams } = new URL(req.url, 'http://localhost');
      const id = searchParams.get('id');
      if (!id) {
        res.status(400).json({ error: 'Se requiere el "id" en la URL (query param)' });
        return;
      }

      await sql`DELETE FROM public.accounts WHERE id = ${Number(id)};`;

      console.log(`[API] DELETE exitoso. Borrado ID: ${id}`);
      res.status(200).json({ ok: true });
      return;
    }

    res.status(405).json({ error: 'Método no permitido' });
  } catch (e) {
    console.error('[API] ¡Error en /accounts!', e);
    res.status(500).json({ error: (e as any)?.message ?? 'Error interno' });
  }
}