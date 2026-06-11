import * as Location from 'expo-location';
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
  /** Sync-Fehlertext direkt nach requestLocation() (State kann noch nicht geflusht sein). */
  lastErrorRef: MutableRefObject<string | null>;
}

const LOCATION_TIMEOUT_MS = 10_000;

function mapLocationError(cause: unknown): string {
  if (cause instanceof Error) {
    if (cause.message.includes('timeout') || cause.message.includes('Timeout')) {
      return i18n.t('search.location_error_timeout');
    }
    return cause.message || i18n.t('search.location_error_generic');
  }
  return i18n.t('search.location_error_generic');
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
        const message = i18n.t('search.location_error_denied');
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
