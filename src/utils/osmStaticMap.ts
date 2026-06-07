/** Zoom-Stufe aus latitudeDelta (grobe Naeherung). */
export function zoomFromLatitudeDelta(latitudeDelta: number): number {
  const clamped = Math.max(0.002, Math.min(latitudeDelta, 20));
  return Math.round(Math.log2(360 / clamped) - 1);
}

export function buildOsmEmbedUrl(options: {
  latitude: number;
  longitude: number;
  latitudeDelta?: number;
  longitudeDelta?: number;
}): string {
  const { latitude, longitude } = options;
  const latDelta = options.latitudeDelta ?? 0.05;
  const lonDelta = options.longitudeDelta ?? latDelta * 1.35;

  const minLat = latitude - latDelta / 2;
  const maxLat = latitude + latDelta / 2;
  const minLon = longitude - lonDelta / 2;
  const maxLon = longitude + lonDelta / 2;

  const params = new URLSearchParams({
    bbox: `${minLon},${minLat},${maxLon},${maxLat}`,
    layer: 'mapnik',
    marker: `${latitude},${longitude}`,
  });

  return `https://www.openstreetmap.org/export/embed.html?${params.toString()}`;
}

/** @deprecated staticmap.openstreetmap.de ist offline — nutze buildOsmEmbedUrl. */
export function buildOsmStaticMapUrl(options: {
  latitude: number;
  longitude: number;
  width: number;
  height: number;
  zoom?: number;
  latitudeDelta?: number;
}): string {
  return buildOsmEmbedUrl(options);
}
