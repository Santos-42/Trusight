// OSS: jose (MIT). Session JWT mockup — HS256, cocok untuk KV session nanti.
// Produksi: SECRET dari env Cloudflare, bukan di kode.

export async function createSessionToken(payload: Record<string, unknown>, secret: string): Promise<string> {
  const { SignJWT } = await import('jose');
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(new TextEncoder().encode(secret));
}

export async function verifySessionToken(token: string, secret: string) {
  const { jwtVerify } = await import('jose');
  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
  return payload as Record<string, unknown>;
}
