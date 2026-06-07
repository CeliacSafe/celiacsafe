import { useCallback, useRef, useState, type MutableRefObject } from 'react';

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

const PERMISSION_DENIED_MESSAGE =
  'Necesitamos acceso a tu ubicación para mostrar restaurantes cercanos.';
const TIMEOUT_MESSAGE = 'No se pudo obtener la ubicación a tiempo. Inténtalo de nuevo.';
const GENERIC_ERROR_MESSAGE = 'No se pudo obtener tu ubicación.';
const UNSUPPORTED_MESSAGE = 'Tu navegador no admite geolocalización.';

function mapGeolocationError(code: number): string {
  switch (code) {
    case 1:
      return PERMISSION_DENIED_MESSAGE;
    case 3:
      return TIMEOUT_MESSAGE;
    default:
      return GENERIC_ERROR_MESSAGE;
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
        const message = UNSUPPORTED_MESSAGE;
        lastErrorRef.current = message;
        setError(message);
        return null;
      }

      const nextLocation = await readCurrentPosition(geolocation);
      setLocation(nextLocation);
      return nextLocation;
    } catch (cause: unknown) {
      const message = cause instanceof Error ? cause.message : GENERIC_ERROR_MESSAGE;
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
