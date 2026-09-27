export function haversineM(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371000;
  const dLat = ((bLat - aLat) * Math.PI) / 180;
  const dLng = ((bLng - aLng) * Math.PI) / 180;
  const s1 = Math.sin(dLat / 2);
  const s2 = Math.sin(dLng / 2);
  const a =
    s1 * s1 + Math.cos((aLat * Math.PI) / 180) * Math.cos((bLat * Math.PI) / 180) * s2 * s2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function withinRadius(
  aLat: number,
  aLng: number,
  bLat: number,
  bLng: number,
  radiusM = 50
): { distance_m: number; valid: boolean } {
  const distance_m = haversineM(aLat, aLng, bLat, bLng);
  return { distance_m: Math.round(distance_m), valid: distance_m <= radiusM };
}
