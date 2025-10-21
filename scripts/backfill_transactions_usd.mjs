import { sql } from '@vercel/postgres';

async function getVesPerUsdByDate(dateISO) {
  try {
    const d = String(dateISO).slice(0, 10);
    if (!d) return null;
    const url = `https://api.dolarvzla.com/public/exchange-rate/list?from=${d}&to=${d}`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    const item = json?.rates?.[0];
    const rate = item?.usd != null ? Number(item.usd) : null; // VES per 1 USD
    if (!rate || !isFinite(rate)) return null;
    return rate;
  } catch {
    return null;
  }
}

async function main() {
  console.log('Backfilling amount_usd and exchange_rate_used for VES transactions without values...');
  const rows = await sql`
    SELECT t.id, t.date, t.amount, t.currency
    FROM public.transactions t
    WHERE (t.amount_usd IS NULL OR t.exchange_rate_used IS NULL)
      AND t.currency = 'VES'
    ORDER BY t.date ASC, t.id ASC
    LIMIT 10000;
  `;
  if (rows.rows.length === 0) {
    console.log('Nothing to backfill.');
    return;
  }

  // Batch by date to avoid repeated calls
  const byDate = new Map();
  for (const r of rows.rows) {
    const d = String(r.date).slice(0, 10);
    if (!byDate.has(d)) byDate.set(d, []);
    byDate.get(d).push(r);
  }

  let updated = 0;
  for (const [date, list] of byDate.entries()) {
    const rate = await getVesPerUsdByDate(date);
    if (!rate) {
      console.warn(`No rate for ${date}, skipping ${list.length} rows`);
      continue;
    }
    for (const r of list) {
      const usd = Number((Number(r.amount) / rate).toFixed(2));
      await sql`UPDATE public.transactions SET amount_usd = ${usd}, exchange_rate_used = ${rate} WHERE id = ${r.id};`;
      updated++;
    }
    // Small delay to be polite with API
    await new Promise(res => setTimeout(res, 150));
  }

  console.log(`Backfill complete. Updated ${updated} rows.`);
}

main().catch(err => { console.error(err); process.exit(1); });
