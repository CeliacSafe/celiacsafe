import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DetailScreen from '../screens/DetailScreen';
import { MapaScreen } from '../screens/MapaScreen';
import { useStackScreenOptions } from './stackScreenOptions';

export type MapaStackParamList = {
  MapaMain: undefined;
  RestaurantDetail: { restaurantId: string };
};

const Stack = createNativeStackNavigator<MapaStackParamList>();

export default function MapaStack() {
  const screenOptions = useStackScreenOptions();
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="MapaMain" component={MapaScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="RestaurantDetail"
        component={DetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
