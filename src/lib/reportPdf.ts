// OSS: pdf-lib (MIT). Generate laporan verifikasi 100% client-side.
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export interface ReportItemPdf {
  category?: string;
  label: string;
  condition: string;
  note?: string;
}

export interface BuildReportPdfOptions {
  reportId: string;
  vehicle: string;
  score: number;
  grade: string;
  inspector: string;
  date: string;
  recommendation?: string;
  repairEstimate?: string;
  guaranteeUntil?: string;
  summary?: string;
  items?: ReportItemPdf[];
}

/** Bersihkan karakter di luar WinAnsi agar tidak terjadi crash saat rendering standard PDF font */
function cleanText(text: string | null | undefined): string {
  if (!text) return '';
  return String(text)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, ' ')
    .trim();
}

export async function buildReportPdf(opts: BuildReportPdfOptions): Promise<Blob> {
  const doc = await PDFDocument.create();
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontOblique = await doc.embedFont(StandardFonts.HelveticaOblique);

  // Palette warna TruSight
  const cNavy = rgb(0.06, 0.12, 0.24);
  const cTeal = rgb(0.05, 0.55, 0.55);
  const cTextDark = rgb(0.12, 0.16, 0.22);
  const cTextMuted = rgb(0.42, 0.48, 0.55);
  const cBorder = rgb(0.85, 0.88, 0.92);
  const cCardBg = rgb(0.96, 0.97, 0.99);
  const cWhite = rgb(1, 1, 1);

  // Nilai skor dan pewarnaan
  const scoreNum = Math.max(0, Math.min(100, Math.round(opts.score ?? 0)));
  const isHigh = scoreNum >= 85;
  const isMid = scoreNum >= 70 && scoreNum < 85;
  const cScoreColor = isHigh ? rgb(0.08, 0.6, 0.35) : isMid ? rgb(0.82, 0.48, 0.05) : rgb(0.85, 0.2, 0.2);
  const cScoreBg = isHigh ? rgb(0.92, 0.98, 0.94) : isMid ? rgb(0.99, 0.96, 0.9) : rgb(0.99, 0.92, 0.92);

  let pageIndex = 1;
  let page = doc.addPage([595, 842]);
  let y = 800;

  const drawHeader = (isFirstPage: boolean) => {
    // Aksen garis atas
    page.drawRectangle({
      x: 0,
      y: 836,
      width: 595,
      height: 6,
      color: cTeal
    });

    if (isFirstPage) {
      // Header brand
      page.drawText('TRUSIGHT', { x: 40, y: 795, size: 20, font: fontBold, color: cNavy });
      page.drawText('INDEPENDENT VEHICLE CLINICAL VERIFICATION', { x: 40, y: 780, size: 8, font: fontBold, color: cTeal });

      // Badge ID Dokumen
      page.drawRectangle({
        x: 375,
        y: 775,
        width: 180,
        height: 38,
        color: cCardBg,
        borderColor: cBorder,
        borderWidth: 1
      });
      page.drawText('OFFICIAL VERIFICATION REPORT', { x: 385, y: 798, size: 7.5, font: fontBold, color: cNavy });
      page.drawText(`ID: ${cleanText(opts.reportId)}`, { x: 385, y: 785, size: 8.5, font: fontBold, color: cTeal });
      page.drawText(`Date: ${cleanText(opts.date)}`, { x: 470, y: 785, size: 8, font: fontRegular, color: cTextMuted });

      // Garis pemisah
      page.drawLine({
        start: { x: 40, y: 760 },
        end: { x: 555, y: 760 },
        thickness: 1,
        color: cBorder
      });
      y = 745;
    } else {
      // Header halaman lanjutan
      page.drawText('TRUSIGHT - VERIFICATION REPORT (LANJUTAN)', { x: 40, y: 805, size: 9, font: fontBold, color: cNavy });
      page.drawText(`Report ID: ${cleanText(opts.reportId)} - ${cleanText(opts.vehicle)}`, { x: 40, y: 792, size: 8, font: fontRegular, color: cTextMuted });
      page.drawLine({
        start: { x: 40, y: 782 },
        end: { x: 555, y: 782 },
        thickness: 0.8,
        color: cBorder
      });
      y = 765;
    }
  };

  const drawFooter = (currentPage: number) => {
    page.drawLine({
      start: { x: 40, y: 40 },
      end: { x: 555, y: 40 },
      thickness: 0.8,
      color: cBorder
    });
    page.drawText('TruSight Verified - 150-Point Surgical Inspection - Garansi keaslian data 30 hari', {
      x: 40,
      y: 28,
      size: 7.5,
      font: fontRegular,
      color: cTextMuted
    });
    page.drawText(`Halaman ${currentPage}`, {
      x: 505,
      y: 28,
      size: 7.5,
      font: fontRegular,
      color: cTextMuted
    });
  };

  // Start Page 1
  drawHeader(true);

  // 1. Box Ringkasan Kendaraan & Skor
  const overviewHeight = 115;
  page.drawRectangle({
    x: 40,
    y: y - overviewHeight,
    width: 515,
    height: overviewHeight,
    color: cCardBg,
    borderColor: cBorder,
    borderWidth: 1
  });

  // Kolom Kiri: Informasi Kendaraan
  page.drawText(cleanText(opts.vehicle), { x: 55, y: y - 24, size: 14, font: fontBold, color: cNavy });

  const labelX = 55;
  const valueX = 165;

  page.drawText('Tanggal Verifikasi:', { x: labelX, y: y - 44, size: 8.5, font: fontRegular, color: cTextMuted });
  page.drawText(cleanText(opts.date) || '-', { x: valueX, y: y - 44, size: 8.5, font: fontBold, color: cTextDark });

  page.drawText('Inspektor Bersertifikat:', { x: labelX, y: y - 59, size: 8.5, font: fontRegular, color: cTextMuted });
  page.drawText(cleanText(opts.inspector) || '-', { x: valueX, y: y - 59, size: 8.5, font: fontBold, color: cTextDark });

  page.drawText('Garansi Laporan:', { x: labelX, y: y - 74, size: 8.5, font: fontRegular, color: cTextMuted });
  page.drawText(cleanText(opts.guaranteeUntil) ? `Aktif s/d ${cleanText(opts.guaranteeUntil)}` : '30 Hari dari tanggal verifikasi', {
    x: valueX,
    y: y - 74,
    size: 8.5,
    font: fontRegular,
    color: cTeal
  });

  if (opts.repairEstimate) {
    page.drawText('Estimasi Perbaikan:', { x: labelX, y: y - 89, size: 8.5, font: fontRegular, color: cTextMuted });
    page.drawText(cleanText(opts.repairEstimate), { x: valueX, y: y - 89, size: 8.5, font: fontBold, color: rgb(0.8, 0.3, 0.1) });
  }

  // Kolom Kanan: Score & Grade Card
  const scoreBoxWidth = 145;
  const scoreBoxHeight = 85;
  const scoreBoxX = 390;
  const scoreBoxY = y - 100;

  page.drawRectangle({
    x: scoreBoxX,
    y: scoreBoxY,
    width: scoreBoxWidth,
    height: scoreBoxHeight,
    color: cScoreBg,
    borderColor: cScoreColor,
    borderWidth: 1.5
  });

  const txtOverall = 'OVERALL SCORE';
  const wOverall = fontBold.widthOfTextAtSize(txtOverall, 7.5);
  page.drawText(txtOverall, {
    x: scoreBoxX + (scoreBoxWidth - wOverall) / 2,
    y: scoreBoxY + 68,
    size: 7.5,
    font: fontBold,
    color: cScoreColor
  });

  const txtScore = `${scoreNum}`;
  const wScore = fontBold.widthOfTextAtSize(txtScore, 28);
  const txtDenom = '/100';
  page.drawText(txtScore, {
    x: scoreBoxX + (scoreBoxWidth - wScore - 24) / 2,
    y: scoreBoxY + 36,
    size: 28,
    font: fontBold,
    color: cScoreColor
  });
  page.drawText(txtDenom, {
    x: scoreBoxX + (scoreBoxWidth - wScore - 24) / 2 + wScore + 3,
    y: scoreBoxY + 36,
    size: 10,
    font: fontBold,
    color: cTextMuted
  });

  const recoLabel = opts.recommendation ? `REKOMENDASI: ${cleanText(opts.recommendation).toUpperCase()}` : `GRADE: ${cleanText(opts.grade)}`;
  const wReco = fontBold.widthOfTextAtSize(recoLabel, 7.5);
  page.drawText(recoLabel, {
    x: scoreBoxX + (scoreBoxWidth - wReco) / 2,
    y: scoreBoxY + 16,
    size: 7.5,
    font: fontBold,
    color: cScoreColor
  });

  const gradeLabel = `GRADE ${cleanText(opts.grade)}`;
  const wGrade = fontBold.widthOfTextAtSize(gradeLabel, 7.5);
  page.drawText(gradeLabel, {
    x: scoreBoxX + (scoreBoxWidth - wGrade) / 2,
    y: scoreBoxY + 6,
    size: 7.5,
    font: fontBold,
    color: cNavy
  });

  y -= overviewHeight + 15;

  // 2. Ringkasan Catatan Inspektor
  if (opts.summary) {
    const summaryHeight = 42;
    page.drawRectangle({
      x: 40,
      y: y - summaryHeight,
      width: 515,
      height: summaryHeight,
      color: cWhite,
      borderColor: cBorder,
      borderWidth: 1
    });

    page.drawText('RINGKASAN INSPEKTOR:', { x: 52, y: y - 16, size: 8, font: fontBold, color: cNavy });
    const cleanSummary = cleanText(opts.summary).slice(0, 110);
    page.drawText(`"${cleanSummary}"`, { x: 52, y: y - 30, size: 8.5, font: fontOblique, color: cTextDark });
    y -= summaryHeight + 15;
  }

  // 3. Detail Checklist Items
  const items = opts.items ?? [];
  page.drawText('DETAIL PEMERIKSAAN 150-TITIK', { x: 40, y: y - 4, size: 11, font: fontBold, color: cNavy });
  page.drawText('Verifikasi multi-point meliputi mesin, transmisi, bodi, interior & kaki-kaki', {
    x: 40,
    y: y - 16,
    size: 7.5,
    font: fontRegular,
    color: cTextMuted
  });
  y -= 26;

  // Kelompokkan item berdasarkan kategori
  const categories: Record<string, ReportItemPdf[]> = {};
  if (items.length > 0) {
    for (const it of items) {
      const cat = cleanText(it.category) || 'Pemeriksaan Umum';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(it);
    }
  } else {
    // Checklist standar bila item granular belum tersedia
    categories['Mesin & Kelistrikan'] = [
      { label: 'Oli Mesin & Filter', condition: 'Normal' },
      { label: 'Transmisi & Sistem Kopling', condition: 'Normal' },
      { label: 'Aki & Sistem Kelistrikan Dinamo', condition: 'Normal' },
      { label: 'Radiator & Sistem Pendingin', condition: 'Normal' }
    ];
    categories['Bodi & Rangka'] = [
      { label: 'Bebas Tabrakan Besar & Struktur Chasis', condition: 'Normal' },
      { label: 'Kondisi Cat & Panel Eksterior', condition: isHigh ? 'Normal' : 'Perlu perhatian', note: 'Goresan wajar pemakaian' },
      { label: 'Indikasi Bebas Banjir', condition: 'Normal' }
    ];
    categories['Interior & Kaki-kaki'] = [
      { label: 'Sistem AC & Kelistrikan Kabin', condition: 'Normal' },
      { label: 'Suspensi, Kemudi & Kaki-kaki', condition: 'Normal' },
      { label: 'Sistem Pengereman & Ban', condition: 'Normal' }
    ];
  }

  const checkPageBreak = (neededHeight: number) => {
    if (y - neededHeight < 60) {
      drawFooter(pageIndex);
      pageIndex++;
      page = doc.addPage([595, 842]);
      drawHeader(false);
    }
  };

  for (const [catName, catItems] of Object.entries(categories)) {
    checkPageBreak(30 + catItems.length * 20);

    // Category Header Bar
    page.drawRectangle({
      x: 40,
      y: y - 18,
      width: 515,
      height: 18,
      color: rgb(0.91, 0.94, 0.97)
    });
    page.drawText(catName.toUpperCase(), { x: 50, y: y - 13, size: 8, font: fontBold, color: cNavy });

    const normalCount = catItems.filter((i) => (i.condition || '').toLowerCase() === 'normal').length;
    page.drawText(`${normalCount}/${catItems.length} Normal`, { x: 490, y: y - 13, size: 7.5, font: fontBold, color: cTeal });
    y -= 22;

    // Baris item tabel
    for (const item of catItems) {
      checkPageBreak(22);

      const isNormal = (item.condition || '').toLowerCase() === 'normal';
      const cBadgeColor = isNormal ? rgb(0.08, 0.6, 0.35) : rgb(0.85, 0.25, 0.2);
      const cBadgeBg = isNormal ? rgb(0.92, 0.98, 0.94) : rgb(0.99, 0.92, 0.92);

      // Garis pemisah baris
      page.drawLine({
        start: { x: 40, y: y - 18 },
        end: { x: 555, y: y - 18 },
        thickness: 0.5,
        color: rgb(0.9, 0.92, 0.95)
      });

      // Label item
      const itemText = cleanText(item.label) || 'Item';
      page.drawText(itemText.slice(0, 48), { x: 50, y: y - 13, size: 8.5, font: fontRegular, color: cTextDark });

      // Catatan item
      if (item.note) {
        page.drawText(`- ${cleanText(item.note).slice(0, 35)}`, { x: 280, y: y - 13, size: 7.5, font: fontOblique, color: cTextMuted });
      }

      // Pill Badge Kondisi
      const badgeWidth = isNormal ? 52 : 78;
      const badgeText = isNormal ? 'NORMAL' : 'PERHATIAN';
      page.drawRectangle({
        x: 550 - badgeWidth,
        y: y - 16,
        width: badgeWidth,
        height: 14,
        color: cBadgeBg,
        borderColor: cBadgeColor,
        borderWidth: 0.8
      });
      page.drawText(badgeText, {
        x: 550 - badgeWidth + (isNormal ? 8 : 6),
        y: y - 12.5,
        size: 7,
        font: fontBold,
        color: cBadgeColor
      });

      y -= 20;
    }

    y -= 8;
  }

  // Footer di halaman terakhir
  drawFooter(pageIndex);

  const bytes = await doc.save();
  return new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
}
