const ok = (data: unknown) => Response.json({ ok: true, data });
const err = (code: string, message: string, status = 400) =>
  Response.json({ ok: false, error: { code, message } }, { status });

export async function onRequestPost({ request, params }: { request: Request; params: { id: string } }) {
  const action = new URL(request.url).pathname.split('/').pop();
  const inspectionId = params.id;

  if (action === 'checkin') {
    const { lat, lng } = (await request.json().catch(() => ({}))) as { lat?: number; lng?: number };
    if (lat == null || lng == null) return err('VALIDATION_ERROR', 'lat/lng wajib');
    // P0: log saja, P3: validasi 50m vs schedules.gps
    return ok({ checkin_valid: 1, distance_m: 12, inspectionId });
  }

  if (action === 'submit') {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    if (!body.score) return err('VALIDATION_ERROR', 'score wajib diisi');
    return ok({ inspectionId, score: body.score, grade: body.grade ?? 'B+', published: true });
  }

  return err('NOT_FOUND', 'Inspection action tidak dikenal', 404);
}

export async function onRequestGet({ params }: { params: { id: string } }) {
  return Response.json({
    ok: true,
    data: { inspection: { id: params.id, score: 85, grade: 'B+', recommendation: 'nego' }, items: [], photos: [] }
  });
}
