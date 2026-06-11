import { useCallback, useRef, useState, type MutableRefObject } from 'react';

import i18n from '../i18n';

interface UserLocation {
  latitude: number;
  longitude: number;
}

interface UseUserLocationResult {
  location: UserLocation | null;
  loading: boolean;
  error: string | null;
  requestLocation: () => Promise<UserLocation | null>;
  lastErrorRef: MutableRefObject<string | null>;
}

const LOCATION_TIMEOUT_MS = 10_000;

function mapGeolocationError(code: number): string {
  switch (code) {
    case 1:
      return i18n.t('search.location_error_denied');
    case 3:
      return i18n.t('search.location_error_timeout');
    default:
      return i18n.t('search.location_error_generic');
  }
}

function getBrowserGeolocation(): Geolocation | null {
  if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
    return null;
  }
  return navigator.geolocation;
}

function readCurrentPosition(geolocation: Geolocation): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (positionError) => {
        reject(new Error(mapGeolocationError(positionError.code)));
      },
      {
        enableHighAccuracy: false,
        timeout: LOCATION_TIMEOUT_MS,
        maximumAge: 60_000,
      }
    );
  });
}

/**
 * Web: direkt navigator.geolocation — expo-location scheitert ohne Permissions API
 * (z. B. Safari) und Browser verlangen oft eine Nutzeraktion für die Abfrage.
 */
export function useUserLocation(): UseUserLocationResult {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastErrorRef = useRef<string | null>(null);

  const requestLocation = useCallback(async (): Promise<UserLocation | null> => {
    setLoading(true);
    setError(null);
    lastErrorRef.current = null;

    try {
      const geolocation = getBrowserGeolocation();
      if (!geolocation) {
        const message = i18n.t('search.location_error_unsupported');
        lastErrorRef.current = message;
        setError(message);
        return null;
      }

      const nextLocation = await readCurrentPosition(geolocation);
      setLocation(nextLocation);
      return nextLocation;
    } catch (cause: unknown) {
      const message =
        cause instanceof Error ? cause.message : i18n.t('search.location_error_generic');
      lastErrorRef.current = message;
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    location,
    loading,
    error,
    requestLocation,
    lastErrorRef,
  };
}

export type { UserLocation, UseUserLocationResult };
