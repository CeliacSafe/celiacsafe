import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { BuscarScreen } from '../screens/BuscarScreen';
import DetailScreen from '../screens/DetailScreen';
import { colors } from '../theme/colors';

export type BuscarStackParamList = {
  BuscarList: undefined;
  RestaurantDetail: { restaurantId: string };
};

const Stack = createNativeStackNavigator<BuscarStackParamList>();

export default function BuscarStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.textPrimary },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="BuscarList" component={BuscarScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="RestaurantDetail"
        component={DetailScreen}
        options={{
          title: 'Restaurant',
          headerBackTitle: 'Zurück',
        }}
      />
    </Stack.Navigator>
  );
}
