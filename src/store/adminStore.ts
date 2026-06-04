import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { ADMIN_PIN } from '../constants/adminConfig';
import type { RestaurantSubmission } from '../types/Submission';
import type { CountryCode, RegionCode, Restaurant } from '../types/Restaurant';
import type { SubmissionData } from '../utils/submitViaEmail';
import {
  csvRowToRestaurant,
  csvRowToSubmission,
  detectCsvKind,
  submissionsToCsv,
} from '../utils/adminCsv';
import { parseCsv } from '../utils/csvParse';
import bundledData from '../data/restaurants.json';

interface ImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

interface AdminState {
  isAuthenticated: boolean;
  dataRevision: number;

  submissions: RestaurantSubmission[];
  overrides: Record<string, Restaurant>;
  addedRestaurants: Restaurant[];
  removedIds: string[];

  hasHydrated: boolean;
  setHasHydrated: (value: boolean) => void;

  authenticate: (pin: string) => boolean;
  logout: () => void;

  addSubmissionFromApp: (data: SubmissionData) => void;
  importCsvText: (text: string, kind?: 'restaurants' | 'submissions' | 'auto') => ImportResult;
  upsertRestaurant: (restaurant: Restaurant) => void;
  hideRestaurant: (id: string) => void;
  restoreRestaurant: (id: string) => void;

  updateSubmissionStatus: (
    id: string,
    status: RestaurantSubmission['status'],
    extra?: Partial<RestaurantSubmission>
  ) => void;
  promoteSubmission: (id: string) => string | null;

  exportSubmissionsCsv: () => string;

  getPendingSubmissionCount: () => number;
  bumpRevision: () => void;
}

function submissionFromApp(data: SubmissionData): RestaurantSubmission {
  return {
    id: `sub_app_${Date.now()}`,
    submittedAt: new Date().toISOString(),
    submittedByEmail: data.submitterEmail,
    submittedByName: data.submitterName,
    restaurantName: data.restaurantName,
    city: data.city,
    countryCode: 'ES',
    address: data.address,
    website: data.website,
    phone: data.contactInfo,
    notes: data.notes,
    status: 'pending',
    source: 'app',
  };
}

function restaurantFromSubmission(submission: RestaurantSubmission, id: string): Restaurant {
  return {
    id,
    name: submission.restaurantName,
    country_code: (submission.countryCode || 'ES') as CountryCode,
    region_code: 'ES-MD' as RegionCode,
    region_name: 'Pendiente de region',
    city: submission.city,
    verification_status: 'to_be_verified',
    address_street: submission.address,
    website: submission.website,
    phone: submission.phone,
    description_es: submission.notes,
  };
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      dataRevision: 0,
      submissions: [],
      overrides: {},
      addedRestaurants: [],
      removedIds: [],
      hasHydrated: false,

      setHasHydrated: (value) => set({ hasHydrated: value }),

      authenticate: (pin) => {
        if (pin.trim() !== ADMIN_PIN) {
          return false;
        }
        set({ isAuthenticated: true });
        return true;
      },

      logout: () => set({ isAuthenticated: false }),

      bumpRevision: () => set((state) => ({ dataRevision: state.dataRevision + 1 })),

      addSubmissionFromApp: (data) => {
        const submission = submissionFromApp(data);
        set((state) => ({
          submissions: [submission, ...state.submissions],
        }));
        get().bumpRevision();
      },

      importCsvText: (text, kind = 'auto') => {
        const { headers, rows } = parseCsv(text);
        const detected =
          kind === 'auto' ? detectCsvKind(headers) : kind === 'restaurants' ? 'restaurants' : 'submissions';

        const result: ImportResult = { imported: 0, skipped: 0, errors: [] };

        if (detected === 'unknown') {
          result.errors.push('CSV-Format nicht erkannt (restaurants oder submissions erwartet).');
          return result;
        }

        if (detected === 'restaurants') {
          for (const row of rows) {
            const restaurant = csvRowToRestaurant(row);
            if (!restaurant) {
              result.skipped += 1;
              continue;
            }
            get().upsertRestaurant(restaurant);
            result.imported += 1;
          }
          return result;
        }

        const existingIds = new Set(get().submissions.map((s) => s.id));
        const merged: RestaurantSubmission[] = [...get().submissions];

        for (const row of rows) {
          const submission = csvRowToSubmission(row);
          if (!submission) {
            result.skipped += 1;
            continue;
          }
          if (existingIds.has(submission.id)) {
            result.skipped += 1;
            continue;
          }
          merged.push(submission);
          existingIds.add(submission.id);
          result.imported += 1;
        }

        set({ submissions: merged });
        get().bumpRevision();
        return result;
      },

      upsertRestaurant: (restaurant) => {
        const bundledIds = new Set(
          (bundledData.restaurants as Restaurant[]).map((r) => r.id)
        );

        set((state) => {
          const removedIds = state.removedIds.filter((rid) => rid !== restaurant.id);

          if (bundledIds.has(restaurant.id)) {
            return {
              removedIds,
              overrides: { ...state.overrides, [restaurant.id]: restaurant },
            };
          }

          const addedRestaurants = state.addedRestaurants.filter((r) => r.id !== restaurant.id);
          addedRestaurants.push(restaurant);
          const overrides = { ...state.overrides };
          delete overrides[restaurant.id];
          return { removedIds, addedRestaurants, overrides };
        });
        get().bumpRevision();
      },

      hideRestaurant: (id) => {
        set((state) => ({
          removedIds: state.removedIds.includes(id) ? state.removedIds : [...state.removedIds, id],
        }));
        get().bumpRevision();
      },

      restoreRestaurant: (id) => {
        set((state) => ({
          removedIds: state.removedIds.filter((rid) => rid !== id),
        }));
        get().bumpRevision();
      },

      updateSubmissionStatus: (id, status, extra) => {
        set((state) => ({
          submissions: state.submissions.map((submission) =>
            submission.id === id ? { ...submission, status, ...extra } : submission
          ),
        }));
        get().bumpRevision();
      },

      promoteSubmission: (id) => {
        const submission = get().submissions.find((s) => s.id === id);
        if (!submission || submission.status === 'promoted') {
          return null;
        }

        const restaurantId = `es_admin_${Date.now()}`;
        const restaurant = restaurantFromSubmission(submission, restaurantId);
        get().upsertRestaurant(restaurant);
        get().updateSubmissionStatus(id, 'promoted', { promotedToRestaurantId: restaurantId });
        return restaurantId;
      },

      exportSubmissionsCsv: () => submissionsToCsv(get().submissions),

      getPendingSubmissionCount: () =>
        get().submissions.filter((s) => s.status === 'pending' || s.status === 'in_review').length,
    }),
    {
      name: 'celiacsafe-admin-data',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        submissions: state.submissions,
        overrides: state.overrides,
        addedRestaurants: state.addedRestaurants,
        removedIds: state.removedIds,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
