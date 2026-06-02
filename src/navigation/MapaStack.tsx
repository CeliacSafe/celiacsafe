import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DetailScreen from '../screens/DetailScreen';
import { MapaScreen } from '../screens/MapaScreen';
import { colors } from '../theme/colors';

export type MapaStackParamList = {
  MapaMain: undefined;
  RestaurantDetail: { restaurantId: string };
};

const Stack = createNativeStackNavigator<MapaStackParamList>();

export default function MapaStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.textPrimary },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="MapaMain" component={MapaScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="RestaurantDetail"
        component={DetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
