const ok = (data: unknown) => Response.json({ ok: true, data });
const err = (code: string, message: string, status = 400) =>
  Response.json({ ok: false, error: { code, message } }, { status });

export async function onRequestPost({ request }: { request: Request }) {
  const body = (await request.json().catch(() => ({}))) as {
    purpose?: string;
    contentType?: string;
    size?: number;
  };
  if (!body.purpose) return err('VALIDATION_ERROR', 'purpose wajib diisi');
  if ((body.size ?? 0) > 5 * 1024 * 1024) return err('VALIDATION_ERROR', 'Maks 5MB per file');
  // MVP: kembalikan key mock. Produksi: generate R2 signed URL via bucket.createSignedUrl
  const key = `${body.purpose}/${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  return ok({ signedUrl: `/api/uploads/put?key=${encodeURIComponent(key)}`, r2_key: key, expires_in: 600 });
}
