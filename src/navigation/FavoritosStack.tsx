import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DetailScreen from '../screens/DetailScreen';
import { FavoritosScreen } from '../screens/FavoritosScreen';
import { useStackScreenOptions } from './stackScreenOptions';

export type FavoritosStackParamList = {
  FavoritosList: undefined;
  RestaurantDetail: { restaurantId: string };
};

const Stack = createNativeStackNavigator<FavoritosStackParamList>();

export default function FavoritosStack() {
  const screenOptions = useStackScreenOptions();
  return (
    <Stack.Navigator screenOptions={screenOptions}>
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
