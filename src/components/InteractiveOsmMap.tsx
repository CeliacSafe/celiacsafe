import { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import type { MapRegion } from '../types/MapRegion';
import type { Restaurant } from '../types/Restaurant';

/**
 * Interaktive OpenStreetMap-Karte für das Web (Leaflet via CDN).
 *
 * Leaflet wird nur einmal lazy nachgeladen, damit der App-Start schlank bleibt
 * und keine npm-Abhängigkeit nötig ist. Diese Komponente wird ausschließlich von
 * MapaScreen.web.tsx importiert, läuft also nie im Native-Bundle.
 */

const LEAFLET_VERSION = '1.9.4';
const LEAFLET_CSS = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`;
const LEAFLET_JS = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`;

let leafletPromise: Promise<any> | null = null;

function loadLeaflet(): Promise<any> {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('Leaflet requires a browser environment'));
  }
  const globalL = (window as any).L;
  if (globalL) {
    return Promise.resolve(globalL);
  }
  if (leafletPromise) {
    return leafletPromise;
  }
  leafletPromise = new Promise((resolve, reject) => {
    if (!document.querySelector('link[data-leaflet]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = LEAFLET_CSS;
      link.setAttribute('data-leaflet', 'true');
      document.head.appendChild(link);
    }
    const script = document.createElement('script');
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => resolve((window as any).L);
    script.onerror = () => reject(new Error('Could not load Leaflet'));
    document.body.appendChild(script);
  });
  return leafletPromise;
}

/** Grobe Umrechnung eines Breitengrad-Spans in eine Web-Mercator-Zoomstufe. */
function zoomFromDelta(latitudeDelta: number): number {
  if (!latitudeDelta || latitudeDelta <= 0) {
    return 12;
  }
  return Math.max(3, Math.min(17, Math.round(Math.log2(360 / latitudeDelta))));
}

interface Props {
  restaurants: Restaurant[];
  region: MapRegion;
  onMarkerPress: (restaurantId: string) => void;
}

export default function InteractiveOsmMap({ restaurants, region, onMarkerPress }: Props) {
  const containerRef = useRef<View>(null);
  const mapRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const onPressRef = useRef(onMarkerPress);
  onPressRef.current = onMarkerPress;

  useEffect(() => {
    let cancelled = false;
    const markers = markersRef.current;
    loadLeaflet()
      .then((L) => {
        const el = containerRef.current as unknown as HTMLElement | null;
        if (cancelled || !el || mapRef.current) {
          return;
        }
        leafletRef.current = L;
        const map = L.map(el, { zoomControl: true, attributionControl: true }).setView(
          [region.latitude, region.longitude],
          zoomFromDelta(region.latitudeDelta)
        );
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap',
        }).addTo(map);
        mapRef.current = map;
        setTimeout(() => map.invalidateSize(), 0);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markers.clear();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView(
        [region.latitude, region.longitude],
        zoomFromDelta(region.latitudeDelta)
      );
    }
  }, [region]);

  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) {
      return;
    }
    const existing = markersRef.current;
    const nextIds = new Set<string>();
    for (const r of restaurants) {
      if (r.latitude == null || r.longitude == null) {
        continue;
      }
      nextIds.add(r.id);
      const current = existing.get(r.id);
      if (current) {
        current.setLatLng([r.latitude, r.longitude]);
      } else {
        const marker = L.marker([r.latitude, r.longitude], { title: r.name });
        marker.on('click', () => onPressRef.current(r.id));
        marker.addTo(map);
        existing.set(r.id, marker);
      }
    }
    for (const [id, marker] of existing) {
      if (!nextIds.has(id)) {
        map.removeLayer(marker);
        existing.delete(id);
      }
    }
  }, [restaurants]);

  return <View ref={containerRef} style={styles.map} />;
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
