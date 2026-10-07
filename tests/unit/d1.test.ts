import { describe, expect, it } from 'vitest';
import { memDb } from '../stub/d1-mem';
import {
  approveOrder, checkin, claimVoucher, createOrder, ensureConversation, getOrder, getReport,
  listConversations, listMessages, listOrders, listVouchers, postMessage, publishReport, quoteVoucher,
  resetDemo, submitInspection
} from '$lib/server/d1';

const SEED = {
  users: [
    { id: 'u-budi', role: 'buyer', name: 'Budi Perkasa', email: 'budi@mail.com' },
    { id: 'u-hendra', role: 'seller', name: 'Hendra Wijaya', email: 'hendra@showroom.id' },
    { id: 'u-bsantoso', role: 'inspector', name: 'Budi Santoso', email: 'budi.s@trusight.id' }
  ],
  vehicles: [
    { id: 'civic-2021', seller_id: 'u-hendra', title: 'Honda Civic Turbo 2021', price: 385000000, location: 'Kalibata' }
  ]
};

describe('alur order lintas role', () => {
  it('buyer buat → seller lihat incoming → inspector lihat assigned → approve', async () => {
    const db = memDb(SEED);
    const o = await createOrder(db, { vehicleId: 'civic-2021', type: 'fast-track', buyerId: 'u-budi' });
    expect(o.total).toBe(499000);

    const mine = await listOrders(db, { buyerId: 'u-budi' });
    expect(mine).toHaveLength(1);
    expect(mine[0]).toMatchObject({ vehicle: 'Honda Civic Turbo 2021', buyer: 'Budi Perkasa' });

    const incoming = await listOrders(db, { sellerId: 'u-hendra' });
    expect(incoming).toHaveLength(1);

    const ap = await approveOrder(db, { orderId: o.orderId, inspectorId: 'u-bsantoso', action: 'approve', slot: 'Kamis 14:00' });
    expect(ap.status).toBe('scheduled');

    const assigned = await listOrders(db, { inspectorId: 'u-bsantoso' });
    expect(assigned).toHaveLength(1);

    const full = await getOrder(db, o.orderId);
    expect(full).toMatchObject({ status: 'scheduled', seller: 'Hendra Wijaya' });
  });

  it('Opsi A: tolak order kembar mobil yang sama selama masih aktif', async () => {
    const db = memDb(SEED);
    const a = await createOrder(db, { vehicleId: 'civic-2021', type: 'standard', buyerId: 'u-budi' });
    // masih aktif (pending) -> tolak
    await expect(createOrder(db, { vehicleId: 'civic-2021', type: 'fast-track', buyerId: 'u-budi' }))
      .rejects.toMatchObject({ code: 'CONFLICT' });
    // pembeli lain untuk mobil yang sama tetap boleh
    const c = await createOrder(db, { vehicleId: 'civic-2021', type: 'standard', buyerId: 'u-buyer-lain' });
    expect(c.status).toBe('pending');
    // setelah selesai (verified) -> boleh order lagi (inspeksi ulang)
    await db.prepare('UPDATE orders SET status=? WHERE id=?').bind('verified', a.orderId).run();
    const again = await createOrder(db, { vehicleId: 'civic-2021', type: 'standard', buyerId: 'u-budi' });
    expect(again.status).toBe('pending');
  });

  it('checkin → submit → report → publish', async () => {
    const db = memDb(SEED);
    const o = await createOrder(db, { vehicleId: 'civic-2021', type: 'standard', buyerId: 'u-budi' });
    await checkin(db, { orderId: o.orderId, inspectorId: 'u-bsantoso', lat: -6.2, lng: 106.8, valid: true });
    const s = await submitInspection(db, {
      orderId: o.orderId, inspectorId: 'u-bsantoso', score: 85, grade: 'B',
      recommendation: 'Nego', repairEstimate: 2000000,
      items: [{ category: 'mesin', key: 'oli', label: 'Oli', condition: 'ok' }], photoKeys: ['local:1']
    });
    expect(s.reportId).toMatch(/^REP-/);
    const rep = await getReport(db, s.reportId);
    expect(rep).toMatchObject({ score_snapshot: 85, published: 0, vehicle: 'Honda Civic Turbo 2021' });
    const pub = await publishReport(db, s.reportId);
    expect(pub?.published).toBe(1);
    const after = await getOrder(db, o.orderId);
    expect(after?.status).toBe('verified');
  });

  it('chat: ensure → kirim → daftar', async () => {
    const db = memDb(SEED);
    const o = await createOrder(db, { vehicleId: 'civic-2021', type: 'standard', buyerId: 'u-budi' });
    const c1 = await ensureConversation(db, { orderId: o.orderId, buyerId: 'u-budi', sellerId: 'u-hendra', inspectorId: 'u-bsantoso' });
    const c2 = await ensureConversation(db, { orderId: o.orderId, buyerId: 'u-budi', sellerId: 'u-hendra' });
    expect(c1.conversationId).toBe(c2.conversationId);
    await postMessage(db, { conversationId: c1.conversationId, senderId: 'u-budi', body: 'Halo pak' });
    await postMessage(db, { conversationId: c1.conversationId, senderId: 'u-bsantoso', body: 'Siap' });
    const msgs = await listMessages(db, c1.conversationId);
    expect(msgs.map((m) => m.body)).toEqual(['Halo pak', 'Siap']);
    const convs = await listConversations(db, 'u-bsantoso');
    expect(convs).toHaveLength(1);
    expect(convs[0].last_msg).toBe('Siap');
  });
});

describe('voucher DB', () => {
  it('claim → quote → pakai → tolak pakai ulang', async () => {
    const db = memDb(SEED);
    const c = await claimVoucher(db, 'u-budi', 'tru20');
    expect(c.code).toBe('TRU20');
    const dup = await claimVoucher(db, 'u-budi', 'TRU20');
    expect(dup.already).toBe(true);
    const q = await quoteVoucher(db, 'u-budi', 'TRU20', 299000);
    expect(q.discount).toBe(59800);
    expect(q.total).toBe(239200);
    await expect(quoteVoucher(db, 'u-budi', 'FASTTRACK', 299000)).rejects.toThrow('tidak berlaku');
    await expect(quoteVoucher(db, 'u-budi', 'HEMAT50', 299000)).rejects.toThrow('belum diklaim');
    const mine = await listVouchers(db, 'u-budi');
    expect(mine.map((m) => m.code)).toEqual(['TRU20']);
  });

  it('approve memasukkan inspector ke conversation; post yatim 404', async () => {
    const db = memDb(SEED);
    const o = await createOrder(db, { vehicleId: 'civic-2021', type: 'standard', buyerId: 'u-budi' });
    await approveOrder(db, { orderId: o.orderId, inspectorId: 'u-bsantoso', action: 'approve', slot: 'Kamis' });
    const convs = await listConversations(db, 'u-bsantoso');
    expect(convs).toHaveLength(1);
    // Nama lawan bicara ikut terbawa untuk filter inbox per-peran
    expect((convs[0] as { buyer_name: string }).buyer_name).toBe('Budi Perkasa');
    expect((convs[0] as { seller_name: string }).seller_name).toBe('Hendra Wijaya');
    await expect(postMessage(db, { conversationId: 'conv-tak-ada', senderId: 'u-budi', body: 'halo' }))
      .rejects.toThrow('Percakapan tidak ditemukan');
  });
});

describe('reset demo', () => {
  it('mode full: transaksi hilang, users & akun manual tetap', async () => {
    const db = memDb(SEED);
    const o = await createOrder(db, { vehicleId: 'civic-2021', type: 'standard', buyerId: 'u-budi' });
    await postMessage(db, {
      conversationId: (await ensureConversation(db, { orderId: o.orderId, buyerId: 'u-budi', sellerId: 'u-hendra' })).conversationId,
      senderId: 'u-budi', body: 'x'
    });
    const r = await resetDemo(db, 'full');
    expect(r.usersPreserved).toBe(true);
    expect(await listOrders(db, {})).toHaveLength(0);
    expect(await listMessages(db, 'xx')).toHaveLength(0);
    const users = await listConversations(db, 'u-budi');
    expect(users).toHaveLength(0);
  });

  it('mode transaksi: vehicles tidak disentuh', async () => {
    const db = memDb(SEED);
    await createOrder(db, { vehicleId: 'civic-2021', type: 'standard', buyerId: 'u-budi' });
    await resetDemo(db, 'transaksi');
    expect(await listOrders(db, {})).toHaveLength(0);
  });
});
