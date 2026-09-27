import { KVEnv, err, getJSON, ok } from '../_db';

const MOCK = [
  { id: 'civic-2021', title: 'Honda Civic Turbo 2021', year: 2021, mileage: 45000, price: 385000000, location: 'Kalibata, Jakarta Selatan', status: 'listed', score: null },
  { id: 'porsche-911-2022', title: 'Porsche 911 Carrera S 2022', year: 2022, mileage: 12400, price: 4750000000, location: 'Jakarta Utara', status: 'certified', score: 94 }
];

export async function onRequestGet({ request, env }: { request: Request; env: KVEnv }) {
  const url = new URL(request.url);
  const kv = env.KV;
  const parts = url.pathname.split('/').filter(Boolean);
  const last = parts[parts.length - 1];

  if (last === 'vehicles') {
    const q = (url.searchParams.get('q') ?? '').toLowerCase();
    if (!kv) return ok({ items: MOCK.filter((v) => v.title.toLowerCase().includes(q)), nextCursor: null });
    // Index list id → ambil dokumen satu per satu (KV tanpa query)
    const ids = (await getJSON<string[]>(kv, 'idx:vehicles:listed')) ?? [];
    const items: unknown[] = [];
    for (const id of ids.slice(0, 20)) {
      const v = await getJSON<Record<string, unknown>>(kv, `vehicle:${id}`);
      if (v && String(v.title ?? '').toLowerCase().includes(q)) items.push(v);
    }
    return ok({ items, nextCursor: null });
  }

  // detail /api/vehicles/:id
  if (!kv) {
    const v = MOCK.find((x) => x.id === last) ?? MOCK[0];
    return ok({ vehicle: v, photos: [], certificate: null, seller: { name: 'Hendra Wijaya', rating: 4.8 } });
  }
  const v = await getJSON(kv, `vehicle:${last}`);
  if (!v) return err('NOT_FOUND', 'Kendaraan tidak ditemukan', 404);
  return ok({ vehicle: v, photos: [], certificate: null });
}
