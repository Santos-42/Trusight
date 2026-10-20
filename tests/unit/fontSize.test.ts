import { describe, expect, it } from 'vitest';
import { FONT_LABEL, FONT_OPTIONS, FONT_PX, getFontSize, resolveFontSize, type FontSize } from '$lib/fontSize';

describe('fontSize', () => {
  it('FONT_PX lengkap untuk ketiga preset', () => {
    expect(Object.keys(FONT_PX).sort()).toEqual(['large', 'normal', 'small']);
    expect(FONT_PX.small).toBeLessThan(FONT_PX.normal);
    expect(FONT_PX.normal).toBeLessThan(FONT_PX.large);
  });

  it('label preset berbahasa Indonesia', () => {
    expect(FONT_LABEL).toEqual({ small: 'Kecil', normal: 'Normal', large: 'Besar' });
    expect(FONT_OPTIONS).toEqual(['small', 'normal', 'large']);
  });

  it('resolveFontSize menolak nilai tak dikenal', () => {
    expect(resolveFontSize('large')).toBe('large');
    expect(resolveFontSize('small')).toBe('small');
    expect(resolveFontSize(null)).toBe('normal');
    expect(resolveFontSize('')).toBe('normal');
    expect(resolveFontSize('huge')).toBe('normal');
    expect(resolveFontSize(12)).toBe('normal');
  });

  it('getFontSize default normal saat SSR/storage kosong', () => {
    expect(getFontSize()).toBe<FontSize>('normal');
  });
});
