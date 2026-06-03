import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DetailScreen from '../screens/DetailScreen';
import { FavoritosScreen } from '../screens/FavoritosScreen';
import { stackScreenOptions } from './stackScreenOptions';

export type FavoritosStackParamList = {
  FavoritosList: undefined;
  RestaurantDetail: { restaurantId: string };
};

const Stack = createNativeStackNavigator<FavoritosStackParamList>();

export default function FavoritosStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen
        name="FavoritosList"
        component={FavoritosScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RestaurantDetail"
        component={DetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
