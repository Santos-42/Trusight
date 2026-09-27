// Web standard (tanpa dep): Web Share API + clipboard fallback.
// Dipakai di: laporan buyer, sertifikasi seller (bagikan ke OLX).

export async function shareOrCopy(opts: { title: string; text: string; url: string }): Promise<'shared' | 'copied'> {
  const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
  if (nav.share) {
    try {
      await nav.share({ title: opts.title, text: opts.text, url: opts.url });
      return 'shared';
    } catch {
      // user batal → fallback salin
    }
  }
  await navigator.clipboard.writeText(`${opts.text} ${opts.url}`);
  return 'copied';
}

export function certificateUrl(shareToken: string): string {
  return `${location.origin}/cert/${shareToken}`;
}
