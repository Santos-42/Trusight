const ok = (data: unknown) => Response.json({ ok: true, data });

export async function onRequestGet() {
  return ok({
    items: [
      { id: '#TS-98211', vehicleTitle: 'Porsche 911 Carrera S', total: 499000, status: 'in_progress', created_at: new Date().toISOString() },
      { id: '#TS-77642', vehicleTitle: 'BMW M4 Competition', total: 299000, status: 'verified', created_at: new Date().toISOString() }
    ]
  });
}
