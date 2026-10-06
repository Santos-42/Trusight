// OSS: pdf-lib (MIT). Generate laporan verifikasi mockup 100% client-side.
export async function buildReportPdf(opts: {
  reportId: string;
  vehicle: string;
  score: number;
  grade: string;
  inspector: string;
  date: string;
}): Promise<Blob> {
  const { PDFDocument, StandardFonts, rgb } = await import('pdf-lib');
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]);
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const body = await doc.embedFont(StandardFonts.Helvetica);
  const draw = (text: string, x: number, y: number, size = 12, bold = false) =>
    page.drawText(text, { x, y, size, font: bold ? font : body, color: rgb(0.1, 0.15, 0.3) });

  draw('TRUSIGHT — VERIFICATION REPORT', 50, 790, 13, true);
  draw(`Report: ${opts.reportId}`, 50, 762);
  draw(`Vehicle: ${opts.vehicle}`, 50, 744);
  draw(`Score: ${opts.score} / Grade: ${opts.grade}`, 50, 726);
  draw(`Inspector: ${opts.inspector}`, 50, 708);
  draw(`Date: ${opts.date}`, 50, 690);
  draw('150-point inspection • Garansi laporan 30 hari (mockup)', 50, 662, 10);
  draw('Dokumen mockup Fase 4 — bukan sertifikat resmi.', 50, 120, 9);
  const bytes = await doc.save();
  return new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
}
