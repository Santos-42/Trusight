export function rupiah(n: number | null | undefined): string {
  if (n == null) return '—';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(n);
}

export function km(n: number | null | undefined): string {
  if (n == null) return '—';
  return `${new Intl.NumberFormat('id-ID').format(n)} km`;
}

/**
 * Grade diturunkan dari score — tidak dipilih manual lagi.
 * Skala: A+ ≥95 · A ≥90 · A- ≥85 · B+ ≥80 · B ≥75 · B- ≥70 · C+ ≥65 · C ≥60 · D <60
 */
export function gradeFromScore(score: number | null | undefined): string {
  const s = Math.max(0, Math.min(100, Math.round(score ?? 0)));
  if (s >= 95) return 'A+';
  if (s >= 90) return 'A';
  if (s >= 85) return 'A-';
  if (s >= 80) return 'B+';
  if (s >= 75) return 'B';
  if (s >= 70) return 'B-';
  if (s >= 65) return 'C+';
  if (s >= 60) return 'C';
  return 'D';
}

/** Rekomendasi juga mengikuti score: ≥85 beli, 70-84 nego, <70 hindari. */
export function recoFromScore(score: number | null | undefined): 'beli' | 'nego' | 'hindari' {
  const s = Math.max(0, Math.min(100, Math.round(score ?? 0)));
  if (s >= 85) return 'beli';
  if (s >= 70) return 'nego';
  return 'hindari';
}

export function gradeColor(grade: string | null | undefined): string {
  if (!grade) return 'bg-slate-100 text-slate-700';
  if (grade.startsWith('A')) return 'bg-emerald-100 text-emerald-800';
  if (grade.startsWith('B')) return 'bg-amber-100 text-amber-800';
  return 'bg-red-100 text-red-800';
}

export function recoColor(reco: string | null | undefined): string {
  if (reco === 'beli') return 'bg-emerald-600 text-white';
  if (reco === 'nego') return 'bg-amber-500 text-white';
  if (reco === 'hindari') return 'bg-red-600 text-white';
  return 'bg-slate-200 text-slate-700';
}

export function recoLabel(reco: string | null | undefined): string {
  if (reco === 'beli') return 'BELI';
  if (reco === 'nego') return 'NEGO';
  if (reco === 'hindari') return 'HINDARI';
  return '—';
}
