import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import { useCallback } from 'react';

import type { BuscarStackParamList } from '../navigation/BuscarStack';
import type { ComunidadStackParamList } from '../navigation/ComunidadStack';
import type { FavoritosStackParamList } from '../navigation/FavoritosStack';
import type { MapaStackParamList } from '../navigation/MapaStack';

type DetailStackParamList =
  | BuscarStackParamList
  | MapaStackParamList
  | FavoritosStackParamList
  | ComunidadStackParamList;

const STACK_ROOT_ROUTES = new Set([
  'BuscarList',
  'MapaMain',
  'FavoritosList',
  'ComunidadMain',
]);

export function useDetailBack() {
  const navigation = useNavigation<NativeStackNavigationProp<DetailStackParamList>>();

  return useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    const rootRoute = navigation.getState().routes[0]?.name;
    if (rootRoute && STACK_ROOT_ROUTES.has(rootRoute)) {
      navigation.navigate(rootRoute as never);
      return;
    }

    if (Platform.OS === 'web') {
      navigation.getParent()?.navigate('Buscar');
    }
  }, [navigation]);
}
