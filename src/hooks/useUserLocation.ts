import * as Location from 'expo-location';
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
  /** Sync-Fehlertext direkt nach requestLocation() (State kann noch nicht geflusht sein). */
  lastErrorRef: MutableRefObject<string | null>;
}

const LOCATION_TIMEOUT_MS = 10_000;

const PERMISSION_DENIED_MESSAGE =
  'Necesitamos acceso a tu ubicación para mostrar restaurantes cercanos.';
const TIMEOUT_MESSAGE = 'No se pudo obtener la ubicación a tiempo. Inténtalo de nuevo.';
const GENERIC_ERROR_MESSAGE = 'No se pudo obtener tu ubicación.';

function mapLocationError(cause: unknown): string {
  if (cause instanceof Error) {
    if (cause.message.includes('timeout') || cause.message.includes('Timeout')) {
      return TIMEOUT_MESSAGE;
    }
    return cause.message || GENERIC_ERROR_MESSAGE;
  }
  return GENERIC_ERROR_MESSAGE;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('timeout'));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error: unknown) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

/**
 * Standort nur auf Knopfdruck — keine Berechtigungsabfrage beim App-Start.
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
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        const message = PERMISSION_DENIED_MESSAGE;
        lastErrorRef.current = message;
        setError(message);
        return null;
      }

      const position = await withTimeout(
        Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        }),
        LOCATION_TIMEOUT_MS
      );

      const nextLocation: UserLocation = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      setLocation(nextLocation);
      return nextLocation;
    } catch (cause: unknown) {
      const message = mapLocationError(cause);
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
