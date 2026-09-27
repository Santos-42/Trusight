// OSS data: OpenStreetMap Nominatim (tanpa API key, rate-limit sopan).
// Mockup-first: reverse-geocode dipakai untuk label alamat di tugas inspector.

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const r = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`,
      { headers: { Accept: 'application/json' } }
    );
    if (!r.ok) return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    const j = (await r.json()) as { display_name?: string };
    return j.display_name?.split(',').slice(0, 3).join(',') ?? `${lat},${lng}`;
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }
}

export function osmEmbedUrl(lat: number, lng: number, z = 16): string {
  const d = 0.005;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${lng - d}%2C${lat - d}%2C${lng + d}%2C${lat + d}&layer=mapnik&marker=${lat}%2C${lng}`;
}
