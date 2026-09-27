import { KVEnv, err, ok, putJSON } from '../_db';

// KV-only: tidak ada bucket — endpoint ini mencatat metadata upload.
// Byte foto/PDF disimpan di IndexedDB (client, mockup). Saat R2 tersedia,
// ganti isi fungsi ini dengan createSignedUrl tanpa mengubah frontend.
export async function onRequestPost({ request, env }: { request: Request; env: KVEnv }) {
  const body = (await request.json().catch(() => ({}))) as {
    purpose?: string;
    contentType?: string;
    size?: number;
  };
  if (!body.purpose) return err('VALIDATION_ERROR', 'purpose wajib diisi');
  if ((body.size ?? 0) > 5 * 1024 * 1024) return err('VALIDATION_ERROR', 'Maks 5MB per file');
  const key = `local:${body.purpose}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  if (env.KV) {
    await putJSON(env.KV, `upload:${key}`, {
      purpose: body.purpose, size: body.size ?? 0, created_at: new Date().toISOString()
    });
  }
  return ok({ signedUrl: null, r2_key: key, store: 'indexeddb', expires_in: 600 });
}
