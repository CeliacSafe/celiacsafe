import { useMemo } from 'react';

import {
  useUserPreferencesStore,
  type UserDietaryPreferences,
} from '../store/userPreferencesStore';
import { hasActiveProfileDietary } from '../utils/filterCriteria';

/** Aktive Profil-Praeferenzen (undefined wenn keine gesetzt). */
export function useProfileDietaryFilter(): UserDietaryPreferences | undefined {
  const dietary = useUserPreferencesStore((state) => state.dietary);
  return useMemo(
    () => (hasActiveProfileDietary(dietary) ? dietary : undefined),
    [dietary]
  );
}
