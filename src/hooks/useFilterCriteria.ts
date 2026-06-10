import { useMemo } from 'react';

import { useFilterStore } from '../store/filterStore';
import { useUserPreferencesStore } from '../store/userPreferencesStore';
import { withProfileDietary } from '../utils/filterCriteria';
import type { FilterCriteria } from '../utils/searchAndFilter';

/** Filterkriterien aus Session-Store plus persistierten Profil-Praeferenzen. */
export function useFilterCriteria(): FilterCriteria {
  const dietary = useUserPreferencesStore((state) => state.dietary);

  const selectedVenueTypes = useFilterStore((state) => state.selectedVenueTypes);
  const selectedRegions = useFilterStore((state) => state.selectedRegions);
  const selectedPriceRanges = useFilterStore((state) => state.selectedPriceRanges);
  const onlyFaceCertified = useFilterStore((state) => state.onlyFaceCertified);
  const onlyAoecsCertified = useFilterStore((state) => state.onlyAoecsCertified);
  const selectedCountry = useFilterStore((state) => state.selectedCountry);
  const selectedCity = useFilterStore((state) => state.selectedCity);
  const deliveryAvailable = useFilterStore((state) => state.deliveryAvailable);
  const dietVegan = useFilterStore((state) => state.dietVegan);
  const dietVegetarian = useFilterStore((state) => state.dietVegetarian);
  const dietLactoseFree = useFilterStore((state) => state.dietLactoseFree);
  const minRating = useFilterStore((state) => state.minRating);
  const categoryTab = useFilterStore((state) => state.categoryTab);

  return useMemo(
    () =>
      withProfileDietary(
        {
          selectedVenueTypes,
          selectedRegions,
          selectedPriceRanges,
          onlyFaceCertified,
          onlyAoecsCertified,
          selectedCountry,
          selectedCity,
          deliveryAvailable,
          dietVegan,
          dietVegetarian,
          dietLactoseFree,
          minRating,
          categoryTab,
        },
        dietary
      ),
    [
      selectedVenueTypes,
      selectedRegions,
      selectedPriceRanges,
      onlyFaceCertified,
      onlyAoecsCertified,
      selectedCountry,
      selectedCity,
      deliveryAvailable,
      dietVegan,
      dietVegetarian,
      dietLactoseFree,
      minRating,
      categoryTab,
      dietary,
    ]
  );
}
