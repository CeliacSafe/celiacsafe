import type { UserDietaryPreferences } from '../store/userPreferencesStore';
import type { FilterCriteria } from './searchAndFilter';

/** Haengt aktive Profil-Praeferenzen an Filterkriterien (nur wenn mindestens eine aktiv). */
export function withProfileDietary(
  criteria: FilterCriteria,
  dietary: UserDietaryPreferences
): FilterCriteria {
  if (!dietary.lactoseFree && !dietary.vegan && !dietary.wheatFree) {
    return criteria;
  }
  return { ...criteria, profileDietary: dietary };
}

export function hasActiveProfileDietary(dietary: UserDietaryPreferences): boolean {
  return dietary.lactoseFree || dietary.vegan || dietary.wheatFree;
}
