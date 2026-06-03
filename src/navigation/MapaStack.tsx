import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DetailScreen from '../screens/DetailScreen';
import { MapaScreen } from '../screens/MapaScreen';
import { stackScreenOptions } from './stackScreenOptions';

export type MapaStackParamList = {
  MapaMain: undefined;
  RestaurantDetail: { restaurantId: string };
};

const Stack = createNativeStackNavigator<MapaStackParamList>();

export default function MapaStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="MapaMain" component={MapaScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="RestaurantDetail"
        component={DetailScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
