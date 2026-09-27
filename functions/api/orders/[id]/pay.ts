import { KVEnv, getJSON, ok, putJSON } from '../../_db';

export async function onRequestPost({ request, params, env }: { request: Request; params: { id: string }; env: KVEnv }) {
  const body = (await request.json().catch(() => ({}))) as { method?: string };
  const orderId = params.id;
  // Gabung payment ke dokumen order — 1 write
  if (env.KV) {
    const order = (await getJSON<Record<string, unknown>>(env.KV, `order:${orderId}`)) ?? { id: orderId };
    order.status = 'paid';
    order.payment = { method: body.method ?? 'QRIS', amount: 499000, paid_at: new Date().toISOString() };
    await putJSON(env.KV, `order:${orderId}`, order);
  }
  return ok({ paymentId: 'pay-mock', redirectUrl: `/app/success/${orderId}`, amount: 499000 });
}
