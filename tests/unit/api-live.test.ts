import { describe, expect, it } from 'vitest';
import { memDb } from '../stub/d1-mem';
import { GET, POST } from '../../src/routes/api/[...path]/+server';

const SEED = {
  users: [
    { id: 'u-budi', role: 'buyer', name: 'Budi Perkasa', email: 'budi@mail.com', password_hash: 'hash:demo' },
    { id: 'u-hendra', role: 'seller', name: 'Hendra Wijaya', email: 'hendra@showroom.id', password_hash: 'hash:demo' },
    { id: 'u-bsantoso', role: 'inspector', name: 'Budi Santoso', email: 'budi.s@trusight.id', password_hash: 'hash:demo' }
  ],
  vehicles: [
    { id: 'civic-2021', seller_id: 'u-hendra', title: 'Honda Civic Turbo 2021', price: 385000000, location: 'Kalibata' }
  ]
};

function ctx(path: string, method: string, body: unknown, db: ReturnType<typeof memDb>): Parameters<typeof GET>[0] {
  return {
    request: new Request(`http://x/api/${path}`, { method, body: body ? JSON.stringify(body) : undefined }),
    params: { path },
    platform: { env: { DB: db } },
    url: new URL(`http://x/api/${path}`)
  } as unknown as Parameters<typeof GET>[0];
}

describe('endpoint live D1', () => {
  it('POST orders → GET mine/incoming/assigned', async () => {
    const db = memDb(SEED);
    const created = await (await POST(ctx('orders', 'POST', { vehicleId: 'civic-2021', type: 'fast-track', buyerId: 'u-budi' }, db))).json();
    expect(created.ok).toBe(true);
    const id: string = created.data.orderId;

    const mine = await (await GET(ctx('orders/mine?buyerId=u-budi', 'GET', null, db))).json();
    expect(mine.data).toHaveLength(1);

    const incoming = await (await GET(ctx('orders/incoming?sellerId=u-hendra', 'GET', null, db))).json();
    expect(incoming.data).toHaveLength(1);

    const ap = await (await POST(ctx(`orders/${id}/approve`, 'POST', { inspectorId: 'u-bsantoso', action: 'approve', slot: 'Kamis 14:00' }, db))).json();
    expect(ap.data.status).toBe('scheduled');

    const assigned = await (await GET(ctx('orders/assigned?inspectorId=u-bsantoso', 'GET', null, db))).json();
    expect(assigned.data).toHaveLength(1);
  });

  it('submit → report → publish → list', async () => {
    const db = memDb(SEED);
    const created = await (await POST(ctx('orders', 'POST', { vehicleId: 'civic-2021', type: 'standard', buyerId: 'u-budi' }, db))).json();
    const id: string = created.data.orderId;
    const sub = await (await POST(ctx('inspections/submit', 'POST', { orderId: id, inspectorId: 'u-bsantoso', score: 88, grade: 'B+', recommendation: 'Ok', repairEstimate: 0 }, db))).json();
    expect(sub.data.reportId).toMatch(/^REP-/);
    const pub = await (await POST(ctx(`reports/${sub.data.reportId}/publish`, 'POST', {}, db))).json();
    expect(pub.data.published).toBe(1);
    const list = await (await GET(ctx('reports', 'GET', null, db))).json();
    expect(list.data).toHaveLength(1);
  });

  it('voucher claim/mine + pay dengan diskon server-side', async () => {
    const db = memDb(SEED);
    const uid = 'u-budi';
    const created = await (await POST(ctx('orders', 'POST', { vehicleId: 'civic-2021', type: 'standard', buyerId: uid }, db))).json();
    const id: string = created.data.orderId;
    const claim = await (await POST(ctx('vouchers/claim', 'POST', { userId: uid, code: 'HEMAT50' }, db))).json();
    expect(claim.ok).toBe(true);
    // Tanpa migrasi 003 di stub: tabel dibuat on-the-fly oleh stub
    const pay = await (await POST(ctx(`orders/${id}/pay`, 'POST', { method: 'QRIS', voucherCode: 'HEMAT50', buyerId: uid }, db))).json();
    expect(pay.data.amount).toBe(created.data.total - 50000);
    expect(pay.data.discount).toBe(50000);
    // Pakai ulang ditolak
    const pay2 = await (await POST(ctx(`orders/${id}/pay`, 'POST', { method: 'QRIS', voucherCode: 'HEMAT50', buyerId: uid }, db))).json();
    expect(pay2.ok).toBe(false);
  });

  it('reset full tanpa key env → 404; dengan key → ok, users tetap', async () => {
    const db = memDb(SEED);
    await POST(ctx('orders', 'POST', { vehicleId: 'civic-2021', type: 'standard', buyerId: 'u-budi' }, db));
    const noKey = await (await POST(ctx('demo/reset?mode=full&key=x', 'POST', {}, db))).json();
    expect(noKey.ok).toBe(false);

    const withKeyCtx = ctx('demo/reset?mode=full&key=k', 'POST', {}, db);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (withKeyCtx.platform as any).env = { DB: db, RESET_KEY: 'k' };
    const res = await (await POST(withKeyCtx)).json();
    expect(res.ok).toBe(true);
    expect(res.data.usersPreserved).toBe(true);
    const mine = await (await GET(ctx('orders/mine?buyerId=u-budi', 'GET', null, db))).json();
    expect(mine.data).toHaveLength(0);
  });
});
