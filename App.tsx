import 'react-native-gesture-handler';
import './src/i18n';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect, useMemo, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Linking, Platform, StyleSheet, View } from 'react-native';

import LoadingSpinner from './src/components/LoadingSpinner';
import { linking } from './src/navigation/linking';
import OnboardingStack from './src/navigation/OnboardingStack';
import { RootTabs } from './src/navigation/RootTabs';
import { buildNavigationTheme } from './src/navigation/theme';
import { useFavoritesStore } from './src/store/favoritesStore';
import { useLanguageStore } from './src/store/languageStore';
import { UserProvider } from './src/context/UserContext';
import { useOnboardingStore } from './src/store/onboardingStore';
import { useThemeStore } from './src/store/themeStore';
import { useUserPreferencesStore } from './src/store/userPreferencesStore';
import { isRestaurantDeepLinkUrl, isWebRestaurantDeepLink } from './src/utils/onboardingSkip';
import { fontAssets } from './src/theme/fonts';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* Beim Hot-Reload kann der Splash bereits ausgeblendet sein */
});

function AppContent() {
  const { colors, isDark } = useTheme();
  const navigationTheme = useMemo(() => buildNavigationTheme(colors, isDark), [colors, isDark]);
  const hasCompletedOnboarding = useOnboardingStore((state) => state.hasCompletedOnboarding);

  if (!hasCompletedOnboarding) {
    return (
      <BottomSheetModalProvider>
        <SafeAreaProvider>
          <NavigationContainer theme={navigationTheme}>
            <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} />
            <OnboardingStack />
          </NavigationContainer>
        </SafeAreaProvider>
      </BottomSheetModalProvider>
    );
  }

  return (
    <BottomSheetModalProvider>
      <SafeAreaProvider>
        <NavigationContainer theme={navigationTheme} linking={linking}>
          <StatusBar style={isDark ? 'light' : 'dark'} backgroundColor={colors.background} />
          <RootTabs />
        </NavigationContainer>
      </SafeAreaProvider>
    </BottomSheetModalProvider>
  );
}

export default function App() {
  const favoritesHydrated = useFavoritesStore((state) => state.hasHydrated);
  const languageHydrated = useLanguageStore((state) => state.hasHydrated);
  const themeHydrated = useThemeStore((state) => state.hasHydrated);
  const userPreferencesHydrated = useUserPreferencesStore((state) => state.hasHydrated);
  const onboardingHydrated = useOnboardingStore((state) => state.hasHydrated);
  const completeOnboarding = useOnboardingStore((state) => state.completeOnboarding);
  const [fontsLoaded] = useFonts(fontAssets);
  const [deepLinkChecked, setDeepLinkChecked] = useState(false);

  useEffect(() => {
    if (deepLinkChecked) {
      return;
    }

    if (isWebRestaurantDeepLink()) {
      completeOnboarding();
      setDeepLinkChecked(true);
      return;
    }

    let cancelled = false;
    const fallback = setTimeout(() => {
      if (!cancelled) {
        setDeepLinkChecked(true);
      }
    }, 2000);

    Linking.getInitialURL()
      .then((url) => {
        if (url && isRestaurantDeepLinkUrl(url)) {
          completeOnboarding();
        }
      })
      .finally(() => {
        if (!cancelled) {
          clearTimeout(fallback);
          setDeepLinkChecked(true);
        }
      });

    return () => {
      cancelled = true;
      clearTimeout(fallback);
    };
  }, [completeOnboarding, deepLinkChecked]);

  const isReady =
    favoritesHydrated &&
    languageHydrated &&
    themeHydrated &&
    userPreferencesHydrated &&
    onboardingHydrated &&
    deepLinkChecked &&
    fontsLoaded;

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [isReady]);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof document === 'undefined') {
      return;
    }

    const viewport = document.querySelector('meta[name="viewport"]');
    if (!viewport) {
      return;
    }

    const content = viewport.getAttribute('content') ?? '';
    if (!content.includes('viewport-fit=cover')) {
      viewport.setAttribute(
        'content',
        `${content}${content ? ', ' : ''}viewport-fit=cover`.replace(/^,\s*/, '')
      );
    }
  }, []);

  return (
    <ThemeProvider>
      <UserProvider>
        <GestureHandlerRootView style={styles.root}>
          {isReady ? (
            <AppContent />
          ) : (
            <View style={styles.boot}>
              <LoadingSpinner fullscreen />
            </View>
          )}
        </GestureHandlerRootView>
      </UserProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  boot: {
    flex: 1,
  },
});
