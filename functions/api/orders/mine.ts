import { KVEnv, getJSON, ok } from '../_db';

const MOCK_ITEMS = [
  { id: '#TS-98211', vehicleTitle: 'Porsche 911 Carrera S', total: 499000, status: 'in_progress', created_at: new Date().toISOString() },
  { id: '#TS-77642', vehicleTitle: 'BMW M4 Competition', total: 299000, status: 'verified', created_at: new Date().toISOString() }
];

export async function onRequestGet({ env }: { env: KVEnv }) {
  if (!env.KV) return ok({ items: MOCK_ITEMS });
  const ids = (await getJSON<string[]>(env.KV, 'idx:orders:buyer:u-budi')) ?? [];
  const items: unknown[] = [];
  for (const id of ids.slice(0, 20)) {
    const o = await getJSON(env.KV, `order:${id}`);
    if (o) items.push(o);
  }
  return ok({ items: items.length ? items : MOCK_ITEMS });
}
