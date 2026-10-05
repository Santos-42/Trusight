import type { ApiRes } from './api';

type Body = Record<string, unknown>;
const ok = <T>(data: T): ApiRes<T> => ({ ok: true, data });
const err = (code: string, message: string): ApiRes<never> => ({ ok: false, error: { code, message } });

const PRICING: Record<string, number> = { standard: 299000, 'fast-track': 499000 };

function auth(action: string, b: Body): ApiRes<unknown> {
  if (action === 'login') {
    if (!b.email || !b.password) return err('VALIDATION_ERROR', 'Email dan password wajib diisi');
    return ok({ user: { id: 'u-mock', name: 'Budi Perkasa', email: b.email, role: 'buyer', trust_score: 98 } });
  }
  if (action === 'register') {
    if (!b.name || !b.email || !b.password) return err('VALIDATION_ERROR', 'Nama, email, password wajib diisi');
    if (String(b.password).length < 8) return err('VALIDATION_ERROR', 'Password minimal 8 karakter');
    return ok({ user: { id: 'u-mock', name: b.name, email: b.email, role: 'buyer', trust_score: 0 } });
  }
  if (action === 'request-account') {
    if (!b.name || !b.email || !b.license_no) return err('VALIDATION_ERROR', 'Nama, email, lisensi wajib diisi');
    return ok({ status: 'pending' });
  }
  if (action === 'send') {
    if (!b.email) return err('VALIDATION_ERROR', 'Email wajib diisi');
    return ok({ sent: true });
  }
  if (action === 'verify') {
    if (!b.code) return err('VALIDATION_ERROR', 'Kode OTP wajib diisi');
    return ok({ verified: true });
  }
  if (action === 'reset') return ok({ ok: true });
  return err('NOT_FOUND', 'Auth action tidak dikenal');
}

/**
 * Mock API lokal — dipakai HANYA saat `vite dev` (`import.meta.env.DEV`),
 * karena folder `functions/` (Pages Functions) tidak hidup di dev server SvelteKit.
 * Produksi tidak tersentuh: di Cloudflare, /api/* dijawab Functions asli.
 * Bentuk respons disamakan dengan functions/api/*/mock fallback.
 */
export function mockHandle(path: string, method: string, body: Body): ApiRes<unknown> {
  const seg = path.split('?')[0].split('/').filter(Boolean);
  if (method !== 'POST') return err('NOT_FOUND', `Mock belum mendukung ${method} ${path}`);

  if (seg[0] === 'auth' && seg[1]) return auth(seg[1], body);

  if (seg[0] === 'orders' && seg.length === 1) {
    if (!body.vehicleId) return err('VALIDATION_ERROR', 'vehicleId wajib diisi');
    const type = body.type === 'fast-track' ? 'fast-track' : 'standard';
    return ok({ orderId: `#TS-${Math.floor(10000 + Math.random() * 89999)}`, total: PRICING[type], status: 'pending' });
  }
  if (seg[0] === 'orders' && seg[2] === 'pay') {
    return ok({ paymentId: 'pay-mock', redirectUrl: `/app/success/${seg[1]}`, amount: 499000 });
  }
  if (seg[0] === 'inspections' && seg[2] === 'submit') {
    if (!body.score) return err('VALIDATION_ERROR', 'score wajib diisi');
    return ok({ inspectionId: seg[1], score: body.score, grade: body.grade ?? 'B+', published: true });
  }
  return err('NOT_FOUND', `Mock belum mendukung ${path}`);
}
