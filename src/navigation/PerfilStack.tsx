import { createNativeStackNavigator } from '@react-navigation/native-stack';

import AboutScreen from '../screens/AboutScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminImportScreen from '../screens/admin/AdminImportScreen';
import AdminLoginScreen from '../screens/admin/AdminLoginScreen';
import AdminRestaurantEditScreen from '../screens/admin/AdminRestaurantEditScreen';
import AdminRestaurantsScreen from '../screens/admin/AdminRestaurantsScreen';
import AdminSubmissionsScreen from '../screens/admin/AdminSubmissionsScreen';
import ImpressumScreen from '../screens/ImpressumScreen';
import PerfilScreen from '../screens/PerfilScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import SubmitRestaurantScreen from '../screens/SubmitRestaurantScreen';
import { useStackScreenOptions } from './stackScreenOptions';

export type PerfilStackParamList = {
  PerfilMain: undefined;
  About: undefined;
  Privacy: undefined;
  Impressum: undefined;
  SubmitRestaurant: undefined;
  AdminLogin: undefined;
  AdminDashboard: undefined;
  AdminRestaurants: undefined;
  AdminRestaurantEdit: { restaurantId?: string; submissionId?: string };
  AdminSubmissions: undefined;
  AdminImport: undefined;
};

const Stack = createNativeStackNavigator<PerfilStackParamList>();

export default function PerfilStack() {
  const screenOptions = useStackScreenOptions();
  return (
    <Stack.Navigator screenOptions={screenOptions}>
      <Stack.Screen name="PerfilMain" component={PerfilScreen} options={{ headerShown: false }} />
      <Stack.Screen name="About" component={AboutScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Impressum" component={ImpressumScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="SubmitRestaurant"
        component={SubmitRestaurantScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="AdminLogin" component={AdminLoginScreen} options={{ headerShown: false }} />
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdminRestaurants"
        component={AdminRestaurantsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdminRestaurantEdit"
        component={AdminRestaurantEditScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdminSubmissions"
        component={AdminSubmissionsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="AdminImport" component={AdminImportScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}
