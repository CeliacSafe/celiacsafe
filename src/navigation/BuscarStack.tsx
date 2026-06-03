import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { BuscarScreen } from '../screens/BuscarScreen';
import DetailScreen from '../screens/DetailScreen';
import { stackScreenOptions } from './stackScreenOptions';

export type BuscarStackParamList = {
  BuscarList: undefined;
  RestaurantDetail: { restaurantId: string };
};

const Stack = createNativeStackNavigator<BuscarStackParamList>();

export default function BuscarStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="BuscarList" component={BuscarScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="RestaurantDetail"
        component={DetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
