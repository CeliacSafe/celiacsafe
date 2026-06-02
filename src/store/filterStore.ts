import { create } from 'zustand';

/**
 * Zentraler Filter-Store fuer Suche, Pill-Filter und Bottom-Sheet-Filter.
 * Der Zustand ist global in der App verfuegbar, aber nicht persistent
 * (bei App-Neustart wird auf Initialwerte zurueckgesetzt).
 */
interface FilterState {
  // Such-State
  searchQuery: string;

  // Pill-Filter (schnell-erreichbare Hauptkategorien)
  selectedVenueTypes: string[];

  // Erweiterte Filter (im Bottom-Sheet)
  selectedRegions: string[];
  selectedPriceRanges: string[];
  onlyFaceCertified: boolean;
  onlyAoecsCertified: boolean;

  // Sortierung
  sortBy: 'name_asc' | 'name_desc' | 'recently_verified';

  // Aktionen
  setSearchQuery: (query: string) => void;
  toggleVenueType: (type: string) => void;
  toggleRegion: (region: string) => void;
  togglePriceRange: (range: string) => void;
  setFaceFilter: (value: boolean) => void;
  setAoecsFilter: (value: boolean) => void;
  setSortBy: (sort: FilterState['sortBy']) => void;
  resetFilters: () => void;

  // Berechnete Eigenschaft
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

  toggleRegion: (region) =>
    set((state) => ({
      selectedRegions: toggleInArray(state.selectedRegions, region),
    })),

  togglePriceRange: (range) =>
    set((state) => ({
      selectedPriceRanges: toggleInArray(state.selectedPriceRanges, range),
    })),

  setFaceFilter: (value) => set({ onlyFaceCertified: value }),
  setAoecsFilter: (value) => set({ onlyAoecsCertified: value }),
  setSortBy: (sort) => set({ sortBy: sort }),

  resetFilters: () => set({ ...initialState }),

  hasActiveFilters: () => {
    const state = get();
    return (
      state.searchQuery.trim().length > 0 ||
      state.selectedVenueTypes.length > 0 ||
      state.selectedRegions.length > 0 ||
      state.selectedPriceRanges.length > 0 ||
      state.onlyFaceCertified ||
      state.onlyAoecsCertified
    );
  },
}));

export type { FilterState };

