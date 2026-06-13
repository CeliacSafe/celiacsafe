import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';

import BuscarStack from './BuscarStack';
import { useTabBarBottomInset } from '../hooks/useTabBarBottomInset';
import ComunidadStack from './ComunidadStack';
import FavoritosStack from './FavoritosStack';
import MapaStack from './MapaStack';
import PerfilStack from './PerfilStack';
import TabBarButton from './TabBarButton';
import { useFavoritesStore } from '../store/favoritesStore';
import { useTheme } from '../theme/ThemeContext';
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

const TAB_BAR_CONTENT_HEIGHT = 56;

export function RootTabs() {
  const { t } = useTranslation();
  const tabBarBottomInset = useTabBarBottomInset();
  const { colors } = useTheme();
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
          backgroundColor: colors.background,
          borderTopColor: colors.lineSoft,
          borderTopWidth: 1,
          minHeight: TAB_BAR_CONTENT_HEIGHT + tabBarBottomInset,
          paddingBottom: tabBarBottomInset + spacing.xs,
          paddingTop: spacing.sm,
        },
      }}
    >
      <Tab.Screen
        name="Buscar"
        component={BuscarStack}
        options={{
          headerShown: false,
          tabBarLabel: t('tabs.search'),
          tabBarIcon: createTabBarIcon('Buscar'),
        }}
      />
      <Tab.Screen
        name="Comunidad"
        component={ComunidadStack}
        options={{
          headerShown: false,
          tabBarLabel: t('tabs.community'),
          tabBarIcon: createTabBarIcon('Comunidad'),
        }}
      />
      <Tab.Screen
        name="Mapa"
        component={MapaStack}
        options={{
          headerShown: false,
          tabBarLabel: t('tabs.map'),
          tabBarIcon: createTabBarIcon('Mapa'),
        }}
      />
      <Tab.Screen
        name="Favoritos"
        component={FavoritosStack}
        options={{
          tabBarLabel: t('tabs.favorites'),
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
          tabBarLabel: t('tabs.profile'),
          tabBarIcon: createTabBarIcon('Perfil'),
        }}
      />
    </Tab.Navigator>
  );
}

// i18n-migrated
