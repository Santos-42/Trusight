import { describe, expect, it } from 'vitest';
import { mockHandle } from '$lib/mockApi';

describe('mockApi (fallback vite dev)', () => {
  it('login bebas + kembalikan user mock', () => {
    const r = mockHandle('/auth/login', 'POST', { email: 'a@b.id', password: 'bebas' });
    expect(r.ok).toBe(true);
    if (r.ok) expect((r.data as { user: { name: string } }).user.name).toBe('Budi Perkasa');
  });

  it('login tanpa password -> VALIDATION_ERROR', () => {
    const r = mockHandle('/auth/login', 'POST', { email: 'a@b.id' });
    expect(r.ok).toBe(false);
  });

  it('login memetakan role per email demo', () => {
    const s = mockHandle('/auth/login', 'POST', { email: 'hendra@showroom.id', password: 'x' });
    expect(s.ok).toBe(true);
    if (s.ok) {
      const u = (s.data as { user: { name: string; role: string } }).user;
      expect(u.role).toBe('seller');
      expect(u.name).toBe('Hendra Wijaya');
    }
    const a = mockHandle('/auth/login', 'POST', { email: 'admin@trusight.id', password: 'x' });
    if (a.ok) expect((a.data as { user: { role: string } }).user.role).toBe('admin');
  });

  it('register tolak password < 8 char', () => {
    const r = mockHandle('/auth/register', 'POST', { name: 'X', email: 'x@y.id', password: '123' });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error.code).toBe('VALIDATION_ERROR');
  });

  it('register sukses selalu buyer', () => {
    const r = mockHandle('/auth/register', 'POST', { name: 'Y', email: 'y@z.id', password: 'demo1234' });
    expect(r.ok).toBe(true);
    if (r.ok) expect((r.data as { user: { role: string } }).user.role).toBe('buyer');
  });

  it('buat order fast-track total 499000', () => {
    const r = mockHandle('/orders', 'POST', { vehicleId: 'civic-2021', type: 'fast-track' });
    expect(r.ok).toBe(true);
    if (r.ok) {
      const d = r.data as { orderId: string; total: number };
      expect(d.total).toBe(499000);
      expect(d.orderId).toMatch(/^#TS-/);
    }
  });

  it('pay kembalikan redirectUrl success', () => {
    const r = mockHandle('/orders/TS-1/pay', 'POST', { method: 'QRIS' });
    expect(r.ok).toBe(true);
    if (r.ok) expect((r.data as { redirectUrl: string }).redirectUrl).toBe('/app/success/TS-1');
  });

  it('submit inspeksi tanpa score -> error', () => {
    const r = mockHandle('/inspections/insp-1/submit', 'POST', { grade: 'A' });
    expect(r.ok).toBe(false);
  });
});
