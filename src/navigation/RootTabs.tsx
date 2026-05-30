import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

import { BuscarScreen } from '../screens/BuscarScreen';
import { ComunidadScreen } from '../screens/ComunidadScreen';
import { FavoritosScreen } from '../screens/FavoritosScreen';
import { MapaScreen } from '../screens/MapaScreen';
import { PerfilScreen } from '../screens/PerfilScreen';
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

const tabConfig: Record<keyof RootTabParamList, { label: string; icon: IconName }> = {
  Buscar: {
    label: 'BUSCAR',
    icon: 'magnify',
  },
  Comunidad: {
    label: 'COMUNIDAD',
    icon: 'account-group-outline',
  },
  Mapa: {
    label: 'MAPA',
    icon: 'map-marker-radius-outline',
  },
  Favoritos: {
    label: 'FAVORITOS',
    icon: 'heart-outline',
  },
  Perfil: {
    label: 'PERFIL',
    icon: 'account-circle-outline',
  },
};

type TabBarIconProps = {
  color: string;
  size: number;
};

function createTabBarIcon(routeName: keyof RootTabParamList) {
  return function TabBarIcon({ color, size }: TabBarIconProps) {
    return <MaterialCommunityIcons name={tabConfig[routeName].icon} color={color} size={size} />;
  };
}

export function RootTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Buscar"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.surface,
        },
      }}
    >
      <Tab.Screen
        name="Buscar"
        component={BuscarScreen}
        options={{
          tabBarLabel: tabConfig.Buscar.label,
          tabBarIcon: createTabBarIcon('Buscar'),
        }}
      />
      <Tab.Screen
        name="Comunidad"
        component={ComunidadScreen}
        options={{
          tabBarLabel: tabConfig.Comunidad.label,
          tabBarIcon: createTabBarIcon('Comunidad'),
        }}
      />
      <Tab.Screen
        name="Mapa"
        component={MapaScreen}
        options={{
          tabBarLabel: tabConfig.Mapa.label,
          tabBarIcon: createTabBarIcon('Mapa'),
        }}
      />
      <Tab.Screen
        name="Favoritos"
        component={FavoritosScreen}
        options={{
          tabBarLabel: tabConfig.Favoritos.label,
          tabBarIcon: createTabBarIcon('Favoritos'),
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilScreen}
        options={{
          tabBarLabel: tabConfig.Perfil.label,
          tabBarIcon: createTabBarIcon('Perfil'),
        }}
      />
    </Tab.Navigator>
  );
}
