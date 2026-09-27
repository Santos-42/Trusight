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
