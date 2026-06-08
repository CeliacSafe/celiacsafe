import type { RatingChip, SearchCategoryTab } from '../data/filterOptions';
import { create } from 'zustand';

/**
 * Zentraler Filter-Store fuer Suche und Karte.
 */
interface FilterState {
  searchQuery: string;
  selectedVenueTypes: string[];
  selectedRegions: string[];
  selectedPriceRanges: string[];
  onlyFaceCertified: boolean;
  onlyAoecsCertified: boolean;
  sortBy: 'name_asc' | 'name_desc' | 'recently_verified';

  selectedCountry: string | null;
  selectedCity: string | null;
  /** null = alle, true = mit Lieferung, false = ohne Lieferung */
  deliveryAvailable: boolean | null;
  dietVegan: boolean;
  dietVegetarian: boolean;
  minRating: RatingChip;
  categoryTab: SearchCategoryTab;

  setSearchQuery: (query: string) => void;
  toggleVenueType: (type: string) => void;
  setVenueTypeSingle: (type: string | null) => void;
  setRegionSingle: (region: string | null) => void;
  toggleRegion: (region: string) => void;
  togglePriceRange: (range: string) => void;
  setPriceRangesAll: () => void;
  setFaceFilter: (value: boolean) => void;
  setAoecsFilter: (value: boolean) => void;
  setSortBy: (sort: FilterState['sortBy']) => void;
  setCountrySingle: (country: string | null) => void;
  setSelectedCity: (city: string | null) => void;
  setDeliveryAvailable: (value: boolean | null) => void;
  setDietVegan: (value: boolean) => void;
  setDietVegetarian: (value: boolean) => void;
  setMinRating: (value: RatingChip) => void;
  setCategoryTab: (tab: SearchCategoryTab) => void;
  resetFilters: () => void;
  hasActiveFilters: () => boolean;
}

const initialState = {
  searchQuery: '',
  selectedVenueTypes: [] as string[],
  selectedRegions: [] as string[],
  selectedPriceRanges: [] as string[],
  onlyFaceCertified: false,
  onlyAoecsCertified: false,
  sortBy: 'name_asc' as const,
  selectedCountry: null as string | null,
  selectedCity: null as string | null,
  deliveryAvailable: null as boolean | null,
  dietVegan: false,
  dietVegetarian: false,
  minRating: 'all' as RatingChip,
  categoryTab: 'all' as SearchCategoryTab,
};

function toggleInArray(items: string[], value: string): string[] {
  return items.includes(value) ? items.filter((item) => item !== value) : [...items, value];
}

export const useFilterStore = create<FilterState>((set, get) => ({
  ...initialState,

  setSearchQuery: (query) => set({ searchQuery: query }),

  toggleVenueType: (type) =>
    set((state) => ({
      selectedVenueTypes: toggleInArray(state.selectedVenueTypes, type),
    })),

  setVenueTypeSingle: (type) =>
    set({
      selectedVenueTypes: type ? [type] : [],
    }),

  setRegionSingle: (region) =>
    set({
      selectedRegions: region ? [region] : [],
      selectedCity: null,
    }),

  toggleRegion: (region) =>
    set((state) => ({
      selectedRegions: toggleInArray(state.selectedRegions, region),
      selectedCity: null,
    })),

  togglePriceRange: (range) =>
    set((state) => ({
      selectedPriceRanges: toggleInArray(state.selectedPriceRanges, range),
    })),

  setPriceRangesAll: () => set({ selectedPriceRanges: [] }),

  setFaceFilter: (value) => set({ onlyFaceCertified: value }),
  setAoecsFilter: (value) => set({ onlyAoecsCertified: value }),
  setSortBy: (sort) => set({ sortBy: sort }),

  setCountrySingle: (country) =>
    set({
      selectedCountry: country,
      selectedRegions: [],
      selectedCity: null,
    }),

  setSelectedCity: (city) => set({ selectedCity: city }),

  setDeliveryAvailable: (value) => set({ deliveryAvailable: value }),

  setDietVegan: (value) => set({ dietVegan: value }),

  setDietVegetarian: (value) => set({ dietVegetarian: value }),

  setMinRating: (value) => set({ minRating: value }),

  setCategoryTab: (tab) =>
    set((state) => {
      if (tab === 'bakery') {
        return { categoryTab: tab, selectedVenueTypes: ['bakery'] };
      }
      if (tab === 'all') {
        return { categoryTab: tab, selectedVenueTypes: [] };
      }
      return {
        categoryTab: tab,
        selectedVenueTypes: state.categoryTab === 'bakery' ? [] : state.selectedVenueTypes,
      };
    }),

  resetFilters: () => set({ ...initialState }),

  hasActiveFilters: () => {
    const state = get();
    return (
      state.searchQuery.trim().length > 0 ||
      state.selectedVenueTypes.length > 0 ||
      state.selectedRegions.length > 0 ||
      state.selectedPriceRanges.length > 0 ||
      state.onlyFaceCertified ||
      state.onlyAoecsCertified ||
      state.selectedCountry != null ||
      state.selectedCity != null ||
      state.deliveryAvailable != null ||
      state.dietVegan ||
      state.dietVegetarian ||
      state.minRating !== 'all'
    );
  },
}));

export type { FilterState };
