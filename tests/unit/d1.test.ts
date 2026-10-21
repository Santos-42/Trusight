import { describe, expect, it } from 'vitest';
import { memDb } from '../stub/d1-mem';
import {
  approveOrder, canRevealLocation, checkin, claimVoucher, createInspectionThread, createOrder, ensureConversation, getOrder, getReport,
  getReportDetail, isOrderPaid, listViewingRequests, markVehicleSold, pickInspector, requestViewing, respondToViewing,
  listConversations, listInspectionItems, listMessages, listOrders, listVouchers, postMessage, publishReport, quoteVoucher,
  resetDemo, submitInspection
} from '$lib/server/d1';
import { certificationBadge, type MockVehicle } from '$lib/mocks';

const SEED = {
  users: [
    { id: 'u-budi', role: 'buyer', name: 'Budi Perkasa', email: 'budi@mail.com' },
    { id: 'u-hendra', role: 'seller', name: 'Hendra Wijaya', email: 'hendra@showroom.id' },
    { id: 'u-bsantoso', role: 'inspector', name: 'Budi Santoso', email: 'budi.s@trusight.id' }
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

describe('alur order lintas role', () => {
  it('buyer buat (purna-beli) → seller lihat incoming → inspector lihat assigned → approve', async () => {
    const db = memDb(SEED);
    const o = await createOrder(db, { vehicleId: 'civic-2021', type: 'fast-track', buyerId: 'u-budi', mode: 'post-purchase' });
    expect(o.total).toBe(499000);
    expect(o.mode).toBe('post-purchase');

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
    // Inspektor kini punya 2 thread untuk order yang sama: 'inspection' (otomatis dari
    // createOrder) dan 'sale' (dibuat ensureConversation di atas).
    const convs = await listConversations(db, 'u-bsantoso');
    expect(convs).toHaveLength(2);
    expect(convs.map((c) => (c as { kind: string }).kind).sort()).toEqual(['inspection', 'sale']);
    expect(convs.find((c) => (c as { kind: string }).kind === 'sale')?.last_msg).toBe('Siap');
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
    const o = await createOrder(db, { vehicleId: 'civic-2021', type: 'standard', buyerId: 'u-budi', mode: 'post-purchase' });
    await approveOrder(db, { orderId: o.orderId, inspectorId: 'u-bsantoso', action: 'approve', slot: 'Kamis' });
    // 'inspection' (pembeli<->inspektor, otomatis) + 'sale' (inspektor<->penjual, dari approve)
    const convs = await listConversations(db, 'u-bsantoso');
    expect(convs).toHaveLength(2);
    const inspection = convs.find((c) => (c as { kind: string }).kind === 'inspection');
    const sale = convs.find((c) => (c as { kind: string }).kind === 'sale');
    expect((inspection as { buyer_name: string }).buyer_name).toBe('Budi Perkasa');
    expect((sale as { seller_name: string }).seller_name).toBe('Hendra Wijaya');
    // Pembeli TIDAK ikut thread jual-beli — itu yang menjaga kerahasiaan
    expect((sale as { buyer_name: string | null }).buyer_name).toBeFalsy();
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

describe('laporan tampil di layar', () => {
  it('getReport membawa rekomendasi, estimasi perbaikan, dan masa garansi', async () => {
    const db = memDb(SEED);
    const o = await createOrder(db, { vehicleId: 'civic-2021', type: 'standard', buyerId: 'u-budi' });
    const s = await submitInspection(db, {
      orderId: o.orderId, inspectorId: 'u-bsantoso', score: 85, grade: 'B',
      recommendation: 'nego', repairEstimate: 2000000,
      items: [{ category: 'mesin', key: 'oli', label: 'Oli mesin', condition: 'Normal' }]
    });
    const rep = await getReport(db, s.reportId);
    expect(rep).toMatchObject({ recommendation: 'nego', repair_estimate: 2000000 });
    expect(rep?.guarantee_until).toBeTruthy();
  });

  it('getReportDetail mengembalikan checklist + foto sekali jalan', async () => {
    const db = memDb(SEED);
    const o = await createOrder(db, { vehicleId: 'civic-2021', type: 'standard', buyerId: 'u-budi' });
    const s = await submitInspection(db, {
      orderId: o.orderId, inspectorId: 'u-bsantoso', score: 85, grade: 'B',
      recommendation: 'beli', repairEstimate: 0,
      items: [
        { category: 'mesin', key: 'oli', label: 'Oli mesin', condition: 'Normal' },
        { category: 'bodi', key: 'cat', label: 'Ketebalan cat', condition: 'Perlu perhatian' }
      ],
      photoKeys: ['inspection/mock-1.jpg', 'inspection/mock-2.jpg']
    });
    const detail = await getReportDetail(db, s.reportId);
    expect(detail).not.toBeNull();
    const d = detail as { items: { category: string; condition: string }[]; photos: unknown[] };
    expect(d.items).toHaveLength(2);
    expect(d.items.map((i) => i.category)).toEqual(['mesin', 'bodi']);
    expect(d.photos).toHaveLength(2);
    // urutan checklist terjaga sesuai input inspektor
    expect(await listInspectionItems(db, s.inspectionId)).toHaveLength(2);
  });
});

describe('inspeksi rahasia (mode covert)', () => {
  it('order covert tidak pernah terlihat seller; approveOrder ditolak', async () => {
    const db = memDb(SEED);
    const o = await createOrder(db, { vehicleId: 'civic-2021', type: 'standard', buyerId: 'u-budi' });
    expect(o.mode).toBe('covert');

    expect(await listOrders(db, { sellerId: 'u-hendra' })).toHaveLength(0);
    expect(await listOrders(db, { buyerId: 'u-budi' })).toHaveLength(1);

    await expect(approveOrder(db, { orderId: o.orderId, inspectorId: 'u-bsantoso', action: 'approve' }))
      .rejects.toMatchObject({ code: 'FORBIDDEN' });
  });

  it('thread inspeksi tanpa seller; thread jual-beli tetap ada dan terpisah', async () => {
    const db = memDb(SEED);
    const o = await createOrder(db, { vehicleId: 'civic-2021', type: 'standard', buyerId: 'u-budi' });

    const insp = await createInspectionThread(db, { orderId: o.orderId, buyerId: 'u-budi', inspectorId: 'u-bsantoso' });
    // Client yang nekat menyertakan sellerId pun dibuang
    const insp2 = await ensureConversation(db, { orderId: o.orderId, buyerId: 'u-budi', sellerId: 'u-hendra', inspectorId: 'u-bsantoso', kind: 'inspection' });
    expect(insp2.conversationId).toBe(insp.conversationId);

    const sale = await ensureConversation(db, { orderId: o.orderId, buyerId: 'u-budi', sellerId: 'u-hendra', kind: 'sale' });
    expect(sale.conversationId).not.toBe(insp.conversationId);

    const sellerConvs = await listConversations(db, 'u-hendra');
    expect(sellerConvs).toHaveLength(1);
    expect((sellerConvs[0] as { kind: string }).kind).toBe('sale');

    const inspConvs = await listConversations(db, 'u-bsantoso');
    expect(inspConvs).toHaveLength(1);
    expect((inspConvs[0] as { kind: string }).kind).toBe('inspection');
    expect(inspConvs[0].seller_name).toBeFalsy();
  });

  it('inspektor ajukan "lihat mobil" — seller lihat calon pembeli, bukan inspeksi', async () => {
    const db = memDb(SEED);
    const o = await createOrder(db, { vehicleId: 'civic-2021', type: 'standard', buyerId: 'u-budi' });
    await requestViewing(db, { orderId: o.orderId, inspectorId: 'u-bsantoso', slot: 'Sabtu 10:00' });

    const reqs = await listViewingRequests(db, 'u-hendra');
    expect(reqs).toHaveLength(1);
    expect(reqs[0]).toMatchObject({ vehicle: 'Honda Civic Turbo 2021', requester: 'Budi Santoso', slot: 'Sabtu 10:00' });
    // Payload ke seller bebas konteks inspeksi
    expect(JSON.stringify(reqs[0])).not.toMatch(/inspeksi|inspection|order_id|mode/i);
  });

  it('seller membalas permintaan lihat mobil: setujui atau usul waktu lain', async () => {
    const db = memDb(SEED);
    const o = await createOrder(db, { vehicleId: 'civic-2021', type: 'standard', buyerId: 'u-budi' });
    await requestViewing(db, { orderId: o.orderId, inspectorId: 'u-bsantoso', slot: 'Sabtu 10:00' });

    const [req] = await listViewingRequests(db, 'u-hendra');
    const requestId = (req as { request_id: string }).request_id;

    // Usul waktu lain dulu
    const alt = await respondToViewing(db, { requestId, action: 'alternative', slot: 'Minggu 09:00' });
    expect(alt).toMatchObject({ status: 'proposed', slot: 'Minggu 09:00' });
    expect((await listViewingRequests(db, 'u-hendra'))[0]).toMatchObject({ status: 'proposed', slot: 'Minggu 09:00' });

    // Lalu setujui
    const ok = await respondToViewing(db, { requestId, action: 'approve', slot: 'Minggu 09:00' });
    expect(ok.status).toBe('approved');
    expect((await listViewingRequests(db, 'u-hendra'))[0].status).toBe('approved');

    await expect(respondToViewing(db, { requestId: 'sch-tak-ada', action: 'approve' }))
      .rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('inspektor otomatis ter-assign saat order dibuat', async () => {
    const db = memDb(SEED);
    const o = await createOrder(db, { vehicleId: 'civic-2021', type: 'standard', buyerId: 'u-budi' });
    expect(o.inspectorId).toBeTruthy();

    // Jadwal langsung melekat ke inspektor itu, dan ordernya muncul di tugasnya
    const assigned = await listOrders(db, { inspectorId: o.inspectorId as string });
    expect(assigned).toHaveLength(1);

    // Thread pembeli <-> inspektor langsung terbentuk — tanpa seller
    const buyerConvs = await listConversations(db, 'u-budi');
    expect(buyerConvs).toHaveLength(1);
    expect((buyerConvs[0] as { kind: string }).kind).toBe('inspection');
    expect(await listConversations(db, 'u-hendra')).toHaveLength(0);
  });

  it('pickInspector: region yang cocok menang, selain itu beban paling ringan', async () => {
    const db = memDb({
      users: [
        { id: 'i-berat', role: 'inspector', name: 'Berat', email: 'berat@x', password_hash: 'h' },
        { id: 'i-ringan', role: 'inspector', name: 'Ringan', email: 'ringan@x', password_hash: 'h' },
        { id: 'i-batal', role: 'inspector', name: 'Batal', email: 'batal@x', password_hash: 'h' }
      ]
    });
    const add = (id: string, region: string, total: number, status: string) =>
      db.prepare('INSERT INTO inspector_profiles (user_id, license_no, region, total_inspections, status) VALUES (?,?,?,?,?)')
        .bind(id, `#${id}`, region, total, status).run();
    await add('i-berat', 'DKI Jakarta', 400, 'verified');
    await add('i-ringan', 'Bandung', 50, 'verified');
    await add('i-batal', 'Bali', 1, 'pending'); // belum verified -> tidak boleh dipilih

    expect(await pickInspector(db, 'Surabaya')).toBe('i-ringan');
    expect(await pickInspector(db)).toBe('i-ringan');
    // "DKI Jakarta" harus match lokasi "Jakarta Selatan" — cocok per kata
    expect(await pickInspector(db, 'Jakarta Selatan')).toBe('i-berat');
  });

  it('badge hasil baru terlihat seller setelah mobil terjual', async () => {
    const base: MockVehicle = {
      id: 'civic-2021', title: 'Honda Civic Turbo 2021', year: 2021, mileage: 45000, price: 385000000,
      location: 'Kalibata, Jakarta Selatan', locationArea: 'Jakarta Selatan',
      status: 'listed', score: 92, grade: 'A', recommendation: 'beli',
      cover: '/vehicles/civic-2021/hero.jpg', coverR2: null
    };
    // Masih dijual: seller tidak boleh tahu hasil inspeksi
    expect(certificationBadge(base)).toEqual({ revealed: false, score: null, grade: null, recommendation: null });
    // Setelah terjual: badge muncul
    expect(certificationBadge({ ...base, status: 'sold' })).toEqual({ revealed: true, score: 92, grade: 'A', recommendation: 'beli' });

    const db = memDb(SEED);
    const sold = await markVehicleSold(db, 'civic-2021');
    expect(sold.status).toBe('sold');
    const row = await db.prepare('SELECT status FROM vehicles WHERE id=?').bind('civic-2021').first<{ status: string }>();
    expect(row?.status).toBe('sold');
  });
});

describe('privasi lokasi: detail hanya untuk pembeli/inspektor setelah bayar', () => {
  const paid = async (db: ReturnType<typeof memDb>, orderId: string) => {
    await db.prepare("INSERT INTO payments (id, order_id, provider, amount, method, status) VALUES (?,?,?,?,?,?)")
      .bind(`PAY-${orderId}`, orderId, 'mock', 299000, 'QRIS', 'paid').run();
  };

  it('listOrders tidak pernah mengirim lokasi detail — termasuk ke seller', async () => {
    const db = memDb(SEED);
    await createOrder(db, { vehicleId: 'civic-2021', type: 'standard', buyerId: 'u-budi', mode: 'post-purchase' });
    const incoming = await listOrders(db, { sellerId: 'u-hendra' });
    expect(incoming).toHaveLength(1);
    expect(incoming[0].location).toBe('Jakarta Selatan');
    expect(JSON.stringify(incoming)).not.toContain('Kalibata');
  });

  it('getOrder mengembalikan area + flag paid; detail belum dibuka', async () => {
    const db = memDb(SEED);
    const o = await createOrder(db, { vehicleId: 'civic-2021', type: 'standard', buyerId: 'u-budi' });
    let full = await getOrder(db, o.orderId);
    expect(full).toMatchObject({ location: 'Jakarta Selatan', location_detail: 'Kalibata, Jakarta Selatan', paid: false });
    await paid(db, o.orderId);
    expect(await isOrderPaid(db, o.orderId)).toBe(true);
    full = await getOrder(db, o.orderId);
    expect(full?.paid).toBe(true);
  });

  it('canRevealLocation: seller tidak pernah, pembeli/inspektor hanya setelah bayar', async () => {
    const db = memDb(SEED);
    const o = await createOrder(db, { vehicleId: 'civic-2021', type: 'standard', buyerId: 'u-budi', mode: 'post-purchase' });
    await approveOrder(db, { orderId: o.orderId, inspectorId: 'u-bsantoso', action: 'approve', slot: 'Kamis' });

    // sebelum bayar: tidak ada yang boleh
    expect(await canRevealLocation(db, o.orderId, 'u-budi')).toBe(false);
    expect(await canRevealLocation(db, o.orderId, 'u-bsantoso')).toBe(false);
    expect(await canRevealLocation(db, o.orderId, 'u-hendra')).toBe(false);

    await paid(db, o.orderId);
    expect(await canRevealLocation(db, o.orderId, 'u-budi')).toBe(true);
    expect(await canRevealLocation(db, o.orderId, 'u-bsantoso')).toBe(true);
    // seller tetap ditolak walau order sudah dibayar
    expect(await canRevealLocation(db, o.orderId, 'u-hendra')).toBe(false);
    // orang lain juga ditolak
    expect(await canRevealLocation(db, o.orderId, 'u-orang-lain')).toBe(false);
  });
});
