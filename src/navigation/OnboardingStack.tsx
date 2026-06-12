import { createNativeStackNavigator } from '@react-navigation/native-stack';

import OnboardingLocationScreen from '../screens/onboarding/OnboardingLocationScreen';
import OnboardingMissionScreen from '../screens/onboarding/OnboardingMissionScreen';
import OnboardingVerificationScreen from '../screens/onboarding/OnboardingVerificationScreen';

export type OnboardingStackParamList = {
  Mission: undefined;
  Verification: undefined;
  Location: undefined;
};

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="Mission" component={OnboardingMissionScreen} />
      <Stack.Screen name="Verification" component={OnboardingVerificationScreen} />
      <Stack.Screen name="Location" component={OnboardingLocationScreen} />
    </Stack.Navigator>
  );
}
