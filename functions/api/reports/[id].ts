const ok = (data: unknown) => Response.json({ ok: true, data });

export async function onRequestGet({ params }: { params: { id: string } }) {
  return ok({
    report: {
      id: params.id,
      score: 94,
      grade: 'A',
      pdfUrl: null,
      vehicle: 'Porsche 911 Carrera S 2022',
      inspector: 'Firman Comstir'
    }
  });
}

export async function onRequestPost() {
  return ok({ reportId: '#REP-3401', pdf_r2_key: 'reports/REP-3401.pdf' });
}
