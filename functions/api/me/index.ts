const ok = (data: unknown) => Response.json({ ok: true, data });

export async function onRequestGet() {
  return ok({ user: { id: 'u-mock', name: 'Budi Perkasa', email: 'budi@mail.com', role: 'buyer', trust_score: 98 } });
}
