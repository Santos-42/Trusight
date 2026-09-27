import { KVEnv, err, ok, pushToIndex, putJSON } from '../_db';

const PRICING: Record<string, number> = { standard: 299000, 'fast-track': 499000 };

export async function onRequestPost({ request, env }: { request: Request; env: KVEnv }) {
  const body = (await request.json().catch(() => ({}))) as { vehicleId?: string; type?: string };
  if (!body.vehicleId) return err('VALIDATION_ERROR', 'vehicleId wajib diisi');
  const type = body.type === 'fast-track' ? 'fast-track' : 'standard';
  const total = PRICING[type];
  const orderId = `#TS-${Math.floor(10000 + Math.random() * 89999)}`;
  const order = {
    id: orderId, buyer_id: 'u-budi', vehicle_id: body.vehicleId,
    type, status: 'pending', total, created_at: new Date().toISOString()
  };
  // KV-only: 1 write dokumen + 1 write index. Tanpa KV → mock.
  if (env.KV) {
    await putJSON(env.KV, `order:${orderId}`, order);
    await pushToIndex(env.KV, 'idx:orders:buyer:u-budi', orderId);
  }
  return ok({ orderId, total, status: 'pending' });
}

export async function onRequestGet() {
  return err('NOT_FOUND', 'Gunakan /api/orders/mine', 404);
}

// Simpan pembayaran gabung di dokumen order (hemat write 1000/hari)
export async function markPaid(kv: KVNamespace, orderId: string, payment: Record<string, unknown>) {
  const key = `order:${orderId}`;
  const raw = await kv.get(key);
  const order = raw ? JSON.parse(raw) : { id: orderId, status: 'pending' };
  order.status = 'paid';
  order.payment = payment;
  await kv.put(key, JSON.stringify(order));
}
