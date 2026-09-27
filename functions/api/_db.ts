// Lapisan data KV-only (Workers KV satu-satunya binding).
// Batas free tier: 1000 writes/hari, 100rb reads/hari, 1GB, value maks 25MB.
// Aturan: tulis hemat (gabung dokumen), blob foto/PDF tetap di IndexedDB (client),
// KV hanya simpan JSON metadata. Eventual consistency ±60 detik global.

export type KVEnv = { KV?: KVNamespace };

export const ok = (data: unknown) => Response.json({ ok: true, data });
export const err = (code: string, message: string, status = 400) =>
  Response.json({ ok: false, error: { code, message } }, { status });

export function uid(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`.toUpperCase();
}

export async function getJSON<T>(kv: KVNamespace, key: string): Promise<T | null> {
  const raw = await kv.get(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function putJSON(kv: KVNamespace, key: string, val: unknown, ttlSec?: number): Promise<void> {
  const body = JSON.stringify(val);
  if (ttlSec) await kv.put(key, body, { expirationTtl: ttlSec });
  else await kv.put(key, body);
}

// Skema key:
//   user:{id}  user:email:{email}->{id}
//   vehicle:{id}  idx:vehicles:listed->[ids]
//   order:{id}  idx:orders:buyer:{buyerId}->[ids]
//   inspection:{id}  inspection:order:{orderId}->{id}
//   report:{id}  upload:{key}->metadata
//   otp:{email}  rl:{scope}:{key}  session:{token}
export async function pushToIndex(kv: KVNamespace, indexKey: string, id: string, cap = 100): Promise<void> {
  const list = (await getJSON<string[]>(kv, indexKey)) ?? [];
  const next = [id, ...list.filter((x) => x !== id)].slice(0, cap);
  await putJSON(kv, indexKey, next);
}
