/** Zoom-Stufe aus latitudeDelta (grobe Naeherung fuer OSM-Static-Maps). */
export function zoomFromLatitudeDelta(latitudeDelta: number): number {
  const clamped = Math.max(0.002, Math.min(latitudeDelta, 20));
  return Math.round(Math.log2(360 / clamped) - 1);
}

export function buildOsmStaticMapUrl(options: {
  latitude: number;
  longitude: number;
  width: number;
  height: number;
  zoom?: number;
  latitudeDelta?: number;
}): string {
  const { latitude, longitude, width, height } = options;
  const zoom =
    options.zoom ??
    (options.latitudeDelta != null ? zoomFromLatitudeDelta(options.latitudeDelta) : 14);

  const params = new URLSearchParams({
    center: `${latitude},${longitude}`,
    zoom: String(zoom),
    size: `${Math.round(width)}x${Math.round(height)}`,
    markers: `${latitude},${longitude},red`,
  });

  return `https://staticmap.openstreetmap.de/staticmap.php?${params.toString()}`;
}
