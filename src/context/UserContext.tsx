import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';

import {
  useUserPreferencesStore,
  type DietaryPreferenceKey,
  type UserDietaryPreferences,
} from '../store/userPreferencesStore';

interface UserContextValue {
  dietaryPreferences: UserDietaryPreferences;
  setDietaryPreference: (key: DietaryPreferenceKey, value: boolean) => void;
  toggleDietaryPreference: (key: DietaryPreferenceKey) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const dietary = useUserPreferencesStore((state) => state.dietary);
  const setDietaryPreference = useUserPreferencesStore((state) => state.setDietaryPreference);
  const toggleDietaryPreference = useUserPreferencesStore(
    (state) => state.toggleDietaryPreference
  );

  const value = useMemo<UserContextValue>(
    () => ({
      dietaryPreferences: dietary,
      setDietaryPreference,
      toggleDietaryPreference,
    }),
    [dietary, setDietaryPreference, toggleDietaryPreference]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return ctx;
}
