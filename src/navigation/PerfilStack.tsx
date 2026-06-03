import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';

import AboutScreen from '../screens/AboutScreen';
import ImpressumScreen from '../screens/ImpressumScreen';
import PerfilScreen from '../screens/PerfilScreen';
import PrivacyScreen from '../screens/PrivacyScreen';
import SubmitRestaurantScreen from '../screens/SubmitRestaurantScreen';
import { colors } from '../theme/colors';

export type PerfilStackParamList = {
  PerfilMain: undefined;
  About: undefined;
  Privacy: undefined;
  Impressum: undefined;
  SubmitRestaurant: undefined;
};

const Stack = createNativeStackNavigator<PerfilStackParamList>();

export default function PerfilStack() {
  const { t } = useTranslation();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.textPrimary, fontWeight: '700' },
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen
        name="PerfilMain"
        component={PerfilScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="About" component={AboutScreen} options={{ title: t('about.title') }} />
      <Stack.Screen
        name="Privacy"
        component={PrivacyScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Impressum"
        component={ImpressumScreen}
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
