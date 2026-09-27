import { describe, expect, it } from 'vitest';
import { haversineM, withinRadius } from '$lib/gps';
import { rupiah } from '$lib/format';
import { PRICING } from '$lib/config';

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
    expect(rupiah(499000)).toContain('499');
  });
  it('fast-track > standard', () => {
    expect(PRICING['fast-track']).toBeGreaterThan(PRICING.standard);
  });
});
