import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ComunidadScreen } from '../screens/ComunidadScreen';
import DetailScreen from '../screens/DetailScreen';
import SubmitRestaurantScreen from '../screens/SubmitRestaurantScreen';
import { stackScreenOptions } from './stackScreenOptions';

export type ComunidadStackParamList = {
  ComunidadMain: undefined;
  RestaurantDetail: { restaurantId: string };
  SubmitRestaurant: undefined;
};

const Stack = createNativeStackNavigator<ComunidadStackParamList>();

export default function ComunidadStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="ComunidadMain"
        component={ComunidadScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RestaurantDetail"
        component={DetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="SubmitRestaurant"
        component={SubmitRestaurantScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
