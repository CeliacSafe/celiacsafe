import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeContext';
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
let popupStylesInjected = false;

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

function injectPopupStyles(primary: string, textSecondary: string, background: string) {
  if (popupStylesInjected || typeof document === 'undefined') {
    return;
  }
  const style = document.createElement('style');
  style.setAttribute('data-celiacsafe-map-popup', 'true');
  style.textContent = `
    .celiacsafe-leaflet-popup .leaflet-popup-content-wrapper {
      background: ${background};
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.18);
      padding: 0;
    }
    .celiacsafe-leaflet-popup .leaflet-popup-content {
      margin: 10px 12px;
      min-width: 120px;
    }
    .celiacsafe-leaflet-popup .leaflet-popup-tip {
      background: ${background};
    }
    .celiacsafe-map-popup-name {
      display: block;
      width: 100%;
      margin: 0;
      padding: 0;
      border: none;
      background: transparent;
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 16px;
      line-height: 1.25;
      letter-spacing: -0.02em;
      color: ${primary};
      text-align: left;
      text-decoration: underline;
      cursor: pointer;
    }
    .celiacsafe-map-popup-name:hover {
      opacity: 0.85;
    }
    .celiacsafe-map-popup-type {
      margin-top: 4px;
      font-family: system-ui, sans-serif;
      font-size: 12px;
      line-height: 1.3;
      color: ${textSecondary};
    }
  `;
  document.head.appendChild(style);
  popupStylesInjected = true;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Grobe Umrechnung eines Breitengrad-Spans in eine Web-Mercator-Zoomstufe. */
function zoomFromDelta(latitudeDelta: number): number {
  if (!latitudeDelta || latitudeDelta <= 0) {
    return 12;
  }
  return Math.max(3, Math.min(17, Math.round(Math.log2(360 / latitudeDelta))));
}

function createPinIcon(
  L: any,
  primary: string,
  accent: string,
  paper: string,
  isSelected: boolean,
  isFeatured: boolean
) {
  const highlighted = isSelected || isFeatured;
  const size = highlighted ? 44 : 36;
  const dotSize = highlighted ? 14 : 12;
  const bg = highlighted ? accent : primary;
  const glow = highlighted
    ? 'box-shadow:0 0 0 8px rgba(212,134,58,0.28),0 4px 12px rgba(0,0,0,0.25);'
    : 'box-shadow:0 4px 12px rgba(0,0,0,0.25);';

  return L.divIcon({
    className: 'celiacsafe-pin',
    html: `<div style="width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;background:${bg};${glow}transform:rotate(-45deg);display:flex;align-items:center;justify-content:center"><div style="width:${dotSize}px;height:${dotSize}px;border-radius:50%;background:${paper};transform:rotate(45deg)"></div></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
  });
}

function buildPopupHtml(name: string, venueTypeLabel: string | null, restaurantId: string): string {
  const typeHtml = venueTypeLabel
    ? `<div class="celiacsafe-map-popup-type">${escapeHtml(venueTypeLabel)}</div>`
    : '';
  return `<button type="button" class="celiacsafe-map-popup-name" data-restaurant-id="${escapeHtml(restaurantId)}">${escapeHtml(name)}</button>${typeHtml}`;
}

interface Props {
  restaurants: Restaurant[];
  region: MapRegion;
  selectedRestaurantId?: string | null;
  getVenueTypeLabel: (restaurant: Restaurant) => string | null;
  onMarkerPress: (restaurantId: string) => void;
  onRestaurantOpen: (restaurantId: string) => void;
}

export default function InteractiveOsmMap({
  restaurants,
  region,
  selectedRestaurantId = null,
  getVenueTypeLabel,
  onMarkerPress,
  onRestaurantOpen,
}: Props) {
  const { colors } = useTheme();
  const containerRef = useRef<View>(null);
  const mapRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const getVenueTypeLabelRef = useRef(getVenueTypeLabel);
  getVenueTypeLabelRef.current = getVenueTypeLabel;
  const onSelectRef = useRef(onMarkerPress);
  onSelectRef.current = onMarkerPress;
  const onOpenRef = useRef(onRestaurantOpen);
  onOpenRef.current = onRestaurantOpen;
  const didFitRef = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    injectPopupStyles(colors.primary, colors.textSecondary, colors.background);
  }, [colors.background, colors.primary, colors.textSecondary]);

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
        map.on('click', () => {
          map.closePopup();
          onSelectRef.current('');
        });
        setTimeout(() => map.invalidateSize(), 0);
        if (!cancelled) {
          setReady(true);
        }
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

  const bindPopupHandlers = (marker: any, restaurantId: string) => {
    marker.off('popupopen');
    marker.on('popupopen', () => {
      const popupEl = marker.getPopup()?.getElement() as HTMLElement | undefined;
      const button = popupEl?.querySelector<HTMLButtonElement>('.celiacsafe-map-popup-name');
      if (!button) {
        return;
      }
      const handleOpen = (event: Event) => {
        event.preventDefault();
        event.stopPropagation();
        onOpenRef.current(restaurantId);
      };
      button.addEventListener('click', handleOpen, { once: true });
    });
  };

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
      const isSelected = r.id === selectedRestaurantId;
      const isFeatured = r.is_premium_partner === true;
      const icon = createPinIcon(
        L,
        colors.primary,
        colors.accent,
        colors.background,
        isSelected,
        isFeatured
      );
      const venueTypeLabel = getVenueTypeLabelRef.current(r);
      const popupHtml = buildPopupHtml(r.name, venueTypeLabel, r.id);
      const current = existing.get(r.id);
      if (current) {
        current.setLatLng([r.latitude, r.longitude]);
        current.setIcon(icon);
        current.bindPopup(popupHtml, {
          closeButton: true,
          className: 'celiacsafe-leaflet-popup',
          maxWidth: 240,
          offset: [0, -8],
        });
        bindPopupHandlers(current, r.id);
      } else {
        const marker = L.marker([r.latitude, r.longitude], { title: r.name, icon });
        marker.bindPopup(popupHtml, {
          closeButton: true,
          className: 'celiacsafe-leaflet-popup',
          maxWidth: 240,
          offset: [0, -8],
        });
        bindPopupHandlers(marker, r.id);
        marker.on('click', (event: { originalEvent?: Event }) => {
          if (event.originalEvent) {
            L.DomEvent.stopPropagation(event.originalEvent);
          }
          onSelectRef.current(r.id);
          marker.openPopup();
        });
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

    if (selectedRestaurantId) {
      const selectedMarker = existing.get(selectedRestaurantId);
      selectedMarker?.openPopup();
    }

    if (!didFitRef.current && existing.size > 0) {
      const bounds = L.latLngBounds(
        Array.from(existing.values()).map((m: any) => m.getLatLng())
      );
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [48, 48], maxZoom: 13 });
        didFitRef.current = true;
      }
    }
  }, [
    restaurants,
    ready,
    selectedRestaurantId,
    colors.primary,
    colors.accent,
    colors.background,
  ]);

  return <View ref={containerRef} style={styles.map} />;
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});
