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
    {
      id: 'civic-2021',
      seller_id: 'u-hendra',
      title: 'Honda Civic Turbo 2021',
      price: 385000000,
      location: 'Kalibata, Jakarta Selatan',
      location_area: 'Jakarta Selatan'
    }
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
  it('POST orders (purna-beli) → GET mine/incoming/assigned', async () => {
    const db = memDb(SEED);
    const created = await (await POST(ctx('orders', 'POST', { vehicleId: 'civic-2021', type: 'fast-track', buyerId: 'u-budi', mode: 'post-purchase' }, db))).json();
    expect(created.ok).toBe(true);
    expect(created.data.mode).toBe('post-purchase');
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

  it('GET /reports/:id membawa checklist + foto untuk tampilan layar', async () => {
    const db = memDb(SEED);
    const created = await (await POST(ctx('orders', 'POST', { vehicleId: 'civic-2021', type: 'standard', buyerId: 'u-budi' }, db))).json();
    const sub = await (await POST(ctx('inspections/submit', 'POST', {
      orderId: created.data.orderId, inspectorId: 'u-bsantoso', score: 88, grade: 'B+',
      recommendation: 'nego', repairEstimate: 1500000,
      items: [
        { category: 'mesin', key: 'oli', label: 'Oli mesin', condition: 'Normal' },
        { category: 'interior', key: 'ac', label: 'AC', condition: 'Perlu perhatian' }
      ],
      photoKeys: ['inspection/mock-1.jpg']
    }, db))).json();

    const rep = await (await GET(ctx(`reports/${sub.data.reportId}`, 'GET', null, db))).json();
    expect(rep.ok).toBe(true);
    expect(rep.data).toMatchObject({ recommendation: 'beli', repair_estimate: 1500000 });
    expect(rep.data.items).toHaveLength(2);
    expect(rep.data.photos).toHaveLength(1);
    expect(rep.data.guarantee_until).toBeTruthy();
  });

  it('GET /orders/:id: lokasi detail hanya untuk pembeli setelah bayar', async () => {
    const db = memDb(SEED);
    const created = await (await POST(ctx('orders', 'POST', { vehicleId: 'civic-2021', type: 'standard', buyerId: 'u-budi' }, db))).json();
    const id: string = created.data.orderId;

    // sebelum bayar: pembeli sekalipun tidak dapat alamat detail
    const before = await (await GET(ctx(`orders/${id}?viewerId=u-budi`, 'GET', null, db))).json();
    expect(before.data.location).toBe('Jakarta Selatan');
    expect(before.data.location_detail).toBeNull();
    expect(before.data.location_revealed).toBe(false);

    await POST(ctx(`orders/${id}/pay`, 'POST', { method: 'QRIS', buyerId: 'u-budi' }, db));

    // setelah bayar: pembeli dapat detail, seller tidak
    const after = await (await GET(ctx(`orders/${id}?viewerId=u-budi`, 'GET', null, db))).json();
    expect(after.data.location_detail).toBe('Kalibata, Jakarta Selatan');
    expect(after.data.location_revealed).toBe(true);

    const seller = await (await GET(ctx(`orders/${id}?viewerId=u-hendra`, 'GET', null, db))).json();
    expect(seller.data.location_detail).toBeNull();
    expect(seller.data.location_revealed).toBe(false);
    expect(JSON.stringify(seller)).not.toContain('Kalibata');
  });

  it('order covert disembunyikan dari seller; inspektor ajukan lihat mobil', async () => {
    const db = memDb(SEED);
    const created = await (await POST(ctx('orders', 'POST', { vehicleId: 'civic-2021', type: 'standard', buyerId: 'u-budi' }, db))).json();
    expect(created.data.mode).toBe('covert');
    const id: string = created.data.orderId;

    // Seller tidak melihat order-nya, hanya "permintaan lihat mobil" tanpa konteks inspeksi
    const incoming = await (await GET(ctx('orders/incoming?sellerId=u-hendra', 'GET', null, db))).json();
    expect(incoming.data).toHaveLength(0);

    const viewing = await (await POST(ctx(`orders/${id}/viewing`, 'POST', { inspectorId: 'u-bsantoso', slot: 'Sabtu 10:00' }, db))).json();
    expect(viewing.data).toMatchObject({ status: 'proposed', slot: 'Sabtu 10:00' });

    const reqs = await (await GET(ctx('viewings/incoming?sellerId=u-hendra', 'GET', null, db))).json();
    expect(reqs.data).toHaveLength(1);
    expect(reqs.data[0]).toMatchObject({ vehicle: 'Honda Civic Turbo 2021', requester: 'Budi Santoso' });
    // Tidak ada satu pun field yang membocorkan konteks inspeksi
    expect(JSON.stringify(reqs.data)).not.toMatch(/inspeksi|inspection|order_id|mode/i);

    // approveOrder tetap ditolak untuk order covert
    const ap = await (await POST(ctx(`orders/${id}/approve`, 'POST', { inspectorId: 'u-bsantoso', action: 'approve' }, db))).json();
    expect(ap.ok).toBe(false);
  });

  it('thread inspeksi tidak melibatkan seller; thread jual-beli terpisah', async () => {
    const db = memDb(SEED);
    const created = await (await POST(ctx('orders', 'POST', { vehicleId: 'civic-2021', type: 'standard', buyerId: 'u-budi' }, db))).json();
    const id: string = created.data.orderId;

    // Client yang nekat mengirim sellerId ke thread inspeksi tetap dibuang server
    const insp = await (await POST(ctx('conversations', 'POST', { orderId: id, buyerId: 'u-budi', sellerId: 'u-hendra', inspectorId: 'u-bsantoso', kind: 'inspection' }, db))).json();
    expect(insp.ok).toBe(true);
    const sale = await (await POST(ctx('conversations', 'POST', { orderId: id, buyerId: 'u-budi', sellerId: 'u-hendra', kind: 'sale' }, db))).json();
    expect(sale.ok).toBe(true);
    expect(sale.data.conversationId).not.toBe(insp.data.conversationId);

    const sellerConvs = await (await GET(ctx('conversations?userId=u-hendra', 'GET', null, db))).json();
    expect(sellerConvs.data).toHaveLength(1);
    expect(sellerConvs.data[0].kind).toBe('sale');

    const inspConvs = await (await GET(ctx('conversations?userId=u-bsantoso', 'GET', null, db))).json();
    expect(inspConvs.data).toHaveLength(1);
    expect(inspConvs.data[0].kind).toBe('inspection');
    expect(inspConvs.data[0].seller_name).toBeFalsy();
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
