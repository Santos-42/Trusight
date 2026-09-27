const ok = (data: unknown) => Response.json({ ok: true, data });

export async function onRequestPost({ params }: { params: { id: string } }) {
  const orderId = params.id;
  return ok({ paymentId: 'pay-mock', redirectUrl: `/app/success/${orderId}`, amount: 499000 });
}
