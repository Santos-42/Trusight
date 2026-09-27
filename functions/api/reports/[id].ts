import { KVEnv, getJSON, ok } from '../_db';

export async function onRequestGet({ params, env }: { params: { id: string }; env: KVEnv }) {
  const saved = env.KV ? await getJSON(env.KV, `report:${params.id}`) : null;
  return ok({
    report: saved ?? {
      id: params.id, score: 94, grade: 'A', pdfUrl: null,
      vehicle: 'Porsche 911 Carrera S 2022', inspector: 'Firman Comstir'
    }
  });
}

export async function onRequestPost() {
  // File PDF tetap di IndexedDB (client); KV hanya catat metadata.
  return ok({ reportId: '#REP-3401', pdf_ref: 'local:reports/REP-3401.pdf' });
}
