const ok = (data: unknown) => Response.json({ ok: true, data });
const err = (code: string, message: string, status = 400) =>
  Response.json({ ok: false, error: { code, message } }, { status });

const PRICING: Record<string, number> = { standard: 299000, 'fast-track': 499000 };

export async function onRequestPost({ request, env }: { request: Request; env: { DB?: D1Database } }) {
  const body = (await request.json().catch(() => ({}))) as { vehicleId?: string; type?: string };
  if (!body.vehicleId) return err('VALIDATION_ERROR', 'vehicleId wajib diisi');
  const type = body.type === 'fast-track' ? 'fast-track' : 'standard';
  const total = PRICING[type];
  const orderId = `#TS-${Math.floor(10000 + Math.random() * 89999)}`;
  if (env.DB) {
    try {
      await env.DB.prepare(
        'INSERT INTO orders (id, buyer_id, vehicle_id, type, status, total) VALUES (?,?,?,?,?,?)'
      )
        .bind(orderId, 'u-mock', body.vehicleId, type, 'pending', total)
        .run();
    } catch (e) {
      console.error(e);
    }
  }
  return ok({ orderId, total, status: 'pending' });
}
