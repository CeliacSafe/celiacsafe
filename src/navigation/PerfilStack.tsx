import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AboutScreen from '../screens/AboutScreen';
import ImpressumScreen from '../screens/ImpressumScreen';
import PerfilScreen from '../screens/PerfilScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import SubmitRestaurantScreen from '../screens/SubmitRestaurantScreen';
import { stackScreenOptions } from './stackScreenOptions';

export type PerfilStackParamList = {
  PerfilMain: undefined;
  About: undefined;
  Privacy: undefined;
  Impressum: undefined;
  SubmitRestaurant: undefined;
};

const Stack = createNativeStackNavigator<PerfilStackParamList>();

export default function PerfilStack() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="PerfilMain" component={PerfilScreen} options={{ headerShown: false }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Impressum" component={ImpressumScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="SubmitRestaurant"
        component={SubmitRestaurantScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
