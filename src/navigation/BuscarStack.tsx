import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { BuscarScreen } from '../screens/BuscarScreen';
import DetailScreen from '../screens/DetailScreen';
import { useStackScreenOptions } from './stackScreenOptions';

export type BuscarStackParamList = {
  BuscarList: undefined;
  RestaurantDetail: { restaurantId: string };
};

const Stack = createNativeStackNavigator<BuscarStackParamList>();

export default function BuscarStack() {
  const screenOptions = useStackScreenOptions();
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="BuscarList" component={BuscarScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="RestaurantDetail"
        component={DetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
