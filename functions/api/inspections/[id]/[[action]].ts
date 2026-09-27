import { KVEnv, err, getJSON, ok, putJSON } from '../../_db';

export async function onRequestPost({ request, params, env }: { request: Request; params: { id: string }; env: KVEnv }) {
  const action = new URL(request.url).pathname.split('/').pop();
  const inspectionId = params.id;

  if (action === 'checkin') {
    const { lat, lng } = (await request.json().catch(() => ({}))) as { lat?: number; lng?: number };
    if (lat == null || lng == null) return err('VALIDATION_ERROR', 'lat/lng wajib');
    if (env.KV) {
      const cur = (await getJSON<Record<string, unknown>>(env.KV, `inspection:${inspectionId}`)) ?? { id: inspectionId };
      cur.checkin_lat = lat;
      cur.checkin_lng = lng;
      cur.checkin_at = new Date().toISOString();
      await putJSON(env.KV, `inspection:${inspectionId}`, cur);
    }
    return ok({ checkin_valid: 1, distance_m: 12, inspectionId });
  }

  if (action === 'submit') {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    if (!body.score) return err('VALIDATION_ERROR', 'score wajib diisi');
    if (env.KV) {
      const cur = (await getJSON<Record<string, unknown>>(env.KV, `inspection:${inspectionId}`)) ?? { id: inspectionId };
      Object.assign(cur, {
        score: body.score, grade: body.grade ?? 'B+',
        recommendation: body.recommendation ?? 'nego',
        repair_estimate: body.repair_estimate ?? 0,
        summary: body.summary ?? '', published_at: new Date().toISOString()
      });
      await putJSON(env.KV, `inspection:${inspectionId}`, cur);
    }
    return ok({ inspectionId, score: body.score, grade: body.grade ?? 'B+', published: true });
  }

  return err('NOT_FOUND', 'Inspection action tidak dikenal', 404);
}

export async function onRequestGet({ params, env }: { params: { id: string }; env: KVEnv }) {
  const saved = env.KV ? await getJSON(env.KV, `inspection:${params.id}`) : null;
  return ok({
    inspection: saved ?? { id: params.id, score: 85, grade: 'B+', recommendation: 'nego' },
    items: [],
    photos: []
  });
}
