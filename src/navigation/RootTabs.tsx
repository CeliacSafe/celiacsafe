import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import BuscarStack from './BuscarStack';
import ComunidadStack from './ComunidadStack';
import FavoritosStack from './FavoritosStack';
import MapaStack from './MapaStack';
import PerfilStack from './PerfilStack';
import TabBarButton from './TabBarButton';
import { useFavoritesStore } from '../store/favoritesStore';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

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
        tabBarButton: TabBarButton,
        tabBarLabelStyle: {
          ...typography.tabLabel,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.primaryDark,
          borderTopWidth: 1,
          height: 56 + insets.bottom,
          paddingBottom: insets.bottom + spacing.xs,
          paddingTop: spacing.sm,
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
        component={ComunidadStack}
        options={{
          headerShown: false,
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
        component={PerfilStack}
        options={{
          headerShown: false,
          tabBarLabel: t('tabs.profile').toUpperCase(),
          tabBarIcon: createTabBarIcon('Perfil'),
        }}
      />
    </Tab.Navigator>
  );
}

// i18n-migrated
