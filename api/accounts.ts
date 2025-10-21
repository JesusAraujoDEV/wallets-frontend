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
        id: String(account.id),
        name: account.name,
        currency: account.currency,
        balance: Number(account.balance),
        type: account.type,
      }));

      res.status(200).json(safeList);
      return;
    }

    if (method === 'POST') {
      console.log('[API] Procesando POST (Crear)...');
      const body = await readJsonBody(req);
      const { name, currency, balance, type: rawType } = body || {};

      if (!name || !currency) {
        res.status(400).json({ error: 'Faltan campos obligatorios: name, currency' });
        return;
      }

      const finalBalance = balance !== undefined ? Number(balance) : 0;
      const type = rawType || 'efectivo';

      const result = await sql`
        INSERT INTO public.accounts (name, "type", currency, balance)
        VALUES (${name}, ${type}, ${currency}, ${finalBalance})
        RETURNING id;
      `;

      const newId = String(result.rows[0].id);
      console.log(`[API] POST exitoso. Nuevo ID: ${newId}`);
      res.status(200).json({ ok: true, newId });
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

  const body = await readJsonBody(req);
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