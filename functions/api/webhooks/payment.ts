const ok = (data: unknown) => Response.json({ ok: true, data });

export async function onRequestPost() {
  // TODO: verifikasi signature Midtrans/Xendit, update payments.status + orders.status=paid
  return ok({ received: true });
}
