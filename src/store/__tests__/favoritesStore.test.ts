jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

import AsyncStorage from '@react-native-async-storage/async-storage';

import { useFavoritesStore } from '../favoritesStore';

const STORAGE_KEY = 'celiacsafe-favorites';

async function resetStore() {
  await useFavoritesStore.persist.clearStorage();
  useFavoritesStore.setState({ favorites: {}, hasHydrated: true });
}

describe('favoritesStore', () => {
  beforeEach(async () => {
    await resetStore();
  });

  it('startet mit leerem Initialzustand', () => {
    const state = useFavoritesStore.getState();

    expect(state.favorites).toEqual({});
    expect(state.getFavoriteCount()).toBe(0);
    expect(state.isFavorite('id1')).toBe(false);
  });

  it('addFavorite macht isFavorite true', () => {
    useFavoritesStore.getState().addFavorite('id1');

    expect(useFavoritesStore.getState().isFavorite('id1')).toBe(true);
  });

  it('addFavorite zweimal mit gleicher ID erzeugt keinen Doppel-Eintrag', () => {
    useFavoritesStore.getState().addFavorite('id1');
    useFavoritesStore.getState().addFavorite('id1');

    expect(useFavoritesStore.getState().getFavoriteCount()).toBe(1);
    expect(useFavoritesStore.getState().isFavorite('id1')).toBe(true);
  });

  it('removeFavorite entfernt den Eintrag', () => {
    useFavoritesStore.getState().addFavorite('id1');
    useFavoritesStore.getState().removeFavorite('id1');

    expect(useFavoritesStore.getState().isFavorite('id1')).toBe(false);
    expect(useFavoritesStore.getState().getFavoriteCount()).toBe(0);
  });

  it('toggleFavorite wechselt off -> on -> off', () => {
    const { toggleFavorite, isFavorite } = useFavoritesStore.getState();

    expect(isFavorite('id1')).toBe(false);

    toggleFavorite('id1');
    expect(useFavoritesStore.getState().isFavorite('id1')).toBe(true);

    toggleFavorite('id1');
    expect(useFavoritesStore.getState().isFavorite('id1')).toBe(false);
  });

  it('getFavoriteCount liefert die korrekte Anzahl', () => {
    const store = useFavoritesStore.getState();

    store.addFavorite('id1');
    store.addFavorite('id2');
    store.addFavorite('id3');

    expect(useFavoritesStore.getState().getFavoriteCount()).toBe(3);
  });

  it('getFavoriteIdsSortedByDate sortiert juengste zuerst', () => {
    useFavoritesStore.setState({
      favorites: {
        id1: '2026-01-01T00:00:00.000Z',
        id2: '2026-06-01T00:00:00.000Z',
        id3: '2026-03-01T00:00:00.000Z',
      },
    });

    expect(useFavoritesStore.getState().getFavoriteIdsSortedByDate()).toEqual([
      'id2',
      'id3',
      'id1',
    ]);
  });

  it('clearAllFavorites leert den Store', () => {
    const store = useFavoritesStore.getState();
    store.addFavorite('id1');
    store.addFavorite('id2');

    store.clearAllFavorites();

    expect(useFavoritesStore.getState().favorites).toEqual({});
    expect(useFavoritesStore.getState().getFavoriteCount()).toBe(0);
  });

  it('persistiert Favoriten ueber simulierten App-Neustart', async () => {
    useFavoritesStore.getState().addFavorite('es_ib_001');

    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });

    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    expect(raw).toBeTruthy();

    const parsed = JSON.parse(raw as string) as {
      state: { favorites: Record<string, string> };
      version: number;
    };

    expect(parsed.version).toBe(0);
    expect(parsed.state.favorites.es_ib_001).toBeDefined();

    // Simulierter Neustart: leerer In-Memory-State, Wiederherstellung aus AsyncStorage
    useFavoritesStore.setState({ favorites: {}, hasHydrated: false });
    useFavoritesStore.setState({
      favorites: parsed.state.favorites,
      hasHydrated: true,
    });

    expect(useFavoritesStore.getState().isFavorite('es_ib_001')).toBe(true);
    expect(useFavoritesStore.getState().getFavoriteCount()).toBe(1);
  });
});
