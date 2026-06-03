import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BuscarStack from './BuscarStack';
import FavoritosStack from './FavoritosStack';
import MapaStack from './MapaStack';
import { ComunidadScreen } from '../screens/ComunidadScreen';
import PerfilScreen from '../screens/PerfilScreen';
import { useFavoritesStore } from '../store/favoritesStore';
import { colors } from '../theme/colors';

type RootTabParamList = {
  Buscar: undefined;
  Comunidad: undefined;
  Mapa: undefined;
  Favoritos: undefined;
  Perfil: undefined;
};

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

const Tab = createBottomTabNavigator<RootTabParamList>();

const tabIcons: Record<keyof RootTabParamList, IconName> = {
  Buscar: 'magnify',
  Comunidad: 'account-group-outline',
  Mapa: 'map-marker-radius-outline',
  Favoritos: 'heart-outline',
  Perfil: 'account-circle-outline',
};

type TabBarIconProps = {
  color: string;
  size: number;
};

function createTabBarIcon(routeName: keyof RootTabParamList) {
  return function TabBarIcon({ color, size }: TabBarIconProps) {
    return <MaterialCommunityIcons name={tabIcons[routeName]} color={color} size={size} />;
  };
}

export function RootTabs() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const favoriteCount = useFavoritesStore((state) => Object.keys(state.favorites).length);

  return (
    <Tab.Navigator
      initialRouteName="Buscar"
      screenOptions={{
        lazy: true,
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.primaryDark,
          borderTopWidth: 1,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 6,
        },
      }}
    >
      <Tab.Screen
        name="Buscar"
        component={BuscarStack}
        options={{
          headerShown: false,
          tabBarLabel: t('tabs.search').toUpperCase(),
          tabBarIcon: createTabBarIcon('Buscar'),
        }}
      />
      <Tab.Screen
        name="Comunidad"
        component={ComunidadScreen}
        options={{
          tabBarLabel: t('tabs.community').toUpperCase(),
          tabBarIcon: createTabBarIcon('Comunidad'),
        }}
      />
      <Tab.Screen
        name="Mapa"
        component={MapaStack}
        options={{
          headerShown: false,
          tabBarLabel: t('tabs.map').toUpperCase(),
          tabBarIcon: createTabBarIcon('Mapa'),
        }}
      />
      <Tab.Screen
        name="Favoritos"
        component={FavoritosStack}
        options={{
          tabBarLabel: t('tabs.favorites').toUpperCase(),
          tabBarIcon: createTabBarIcon('Favoritos'),
          tabBarBadge: favoriteCount > 0 ? favoriteCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.heart,
            color: colors.white,
          },
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          tabBarLabel: t('tabs.profile').toUpperCase(),
          tabBarIcon: createTabBarIcon('Perfil'),
        }}
      />
    </Tab.Navigator>
  );
}

// i18n-migrated
