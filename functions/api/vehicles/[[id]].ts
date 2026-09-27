const ok = (data: unknown) => Response.json({ ok: true, data });
const err = (code: string, message: string, status = 400) =>
  Response.json({ ok: false, error: { code, message } }, { status });

const MOCK = [
  { id: 'civic-2021', title: 'Honda Civic Turbo 2021', year: 2021, mileage: 45000, price: 385000000, location: 'Kalibata, Jakarta Selatan', status: 'listed', score: null, coverR2: null },
  { id: 'porsche-911-2022', title: 'Porsche 911 Carrera S 2022', year: 2022, mileage: 12400, price: 4750000000, location: 'Jakarta Utara', status: 'certified', score: 94, coverR2: null }
];

export async function onRequestGet({ request, env }: { request: Request; env: { DB?: D1Database } }) {
  const url = new URL(request.url);
  const parts = url.pathname.split('/').filter(Boolean);
  const id = parts[parts.length - 1];

  if (url.pathname.endsWith('/vehicles') || url.pathname.endsWith('/vehicles/')) {
    const q = (url.searchParams.get('q') ?? '').toLowerCase();
    if (!env.DB) {
      return ok({ items: MOCK.filter((v) => v.title.toLowerCase().includes(q)), nextCursor: null });
    }
    const rows = await env.DB.prepare(
      'SELECT id, title, year, mileage, price, location, status FROM vehicles WHERE status=? LIMIT 20'
    )
      .bind('listed')
      .all();
    return ok({ items: rows.results, nextCursor: null });
  }

  // detail
  if (!env.DB) {
    const v = MOCK.find((x) => x.id === id) ?? MOCK[0];
    return ok({ vehicle: v, photos: [], certificate: null, seller: { name: 'Hendra Wijaya', rating: 4.8 } });
  }
  const v = await env.DB.prepare('SELECT * FROM vehicles WHERE id=?').bind(id).first();
  if (!v) return err('NOT_FOUND', 'Kendaraan tidak ditemukan', 404);
  return ok({ vehicle: v, photos: [], certificate: null });
}
