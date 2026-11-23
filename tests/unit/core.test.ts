import { describe, expect, it } from 'vitest';
import { haversineM, withinRadius } from '$lib/gps';
import { rupiah } from '$lib/format';
import { PRICING } from '$lib/config';
import { buildReportPdf } from '$lib/reportPdf';

describe('gps 50m strict (OSS, mockup)', () => {
  it('titik 12m valid', () => {
    expect(withinRadius(-6.2581, 106.8451, -6.258, 106.845, 50).valid).toBe(true);
  });
  it('titik jauh tidak valid', () => {
    expect(withinRadius(-6.2581, 106.8451, -6.3, 106.9, 50).valid).toBe(false);
  });
  it('haversine konsisten', () => {
    expect(haversineM(0, 0, 0, 0)).toBe(0);
  });
});

describe('format + pricing', () => {
  it('rupiah', () => {
    expect(rupiah(650000)).toContain('650');
  });
  it('fast-track > standard', () => {
    expect(PRICING['fast-track']).toBeGreaterThan(PRICING.standard);
  });
});

describe('buildReportPdf verification report', () => {
  it('membuat PDF blob valid dengan detail inspeksi', async () => {
    const blob = await buildReportPdf({
      reportId: 'REP-58930',
      vehicle: 'Honda Civic Turbo 2021',
      score: 85,
      grade: 'A-',
      inspector: 'Firman Comstir',
      date: '27 Okt 2026',
      recommendation: 'Beli',
      repairEstimate: 'Rp 1.500.000',
      guaranteeUntil: '26 Nov 2026',
      summary: 'Kondisi keseluruhan sangat baik.',
      items: [
        { category: 'Mesin & Kelistrikan', label: 'Oli Mesin', condition: 'Normal' },
        { category: 'Bodi & Cat', label: 'Bumper Depan', condition: 'Perlu perhatian', note: 'Baret halus' }
      ]
    });
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe('application/pdf');
    expect(blob.size).toBeGreaterThan(1000);
  });
});
