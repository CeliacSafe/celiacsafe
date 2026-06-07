import { buildOsmEmbedUrl, zoomFromLatitudeDelta } from '../osmStaticMap';

describe('osmStaticMap', () => {
  it('berechnet Zoom aus latitudeDelta', () => {
    expect(zoomFromLatitudeDelta(0.05)).toBeGreaterThan(10);
    expect(zoomFromLatitudeDelta(1)).toBeLessThan(zoomFromLatitudeDelta(0.05));
  });

  it('erzeugt OpenStreetMap-Embed-URL mit bbox und Marker', () => {
    const url = buildOsmEmbedUrl({
      latitude: 40.4,
      longitude: -3.7,
      latitudeDelta: 0.1,
    });

    expect(url).toMatch(/^https:\/\/www\.openstreetmap\.org\/export\/embed\.html\?/);
    expect(url).toContain('layer=mapnik');
    expect(url).toContain('marker=40.4%2C-3.7');
    expect(url).toContain('bbox=');
  });
});
