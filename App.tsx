import 'react-native-gesture-handler';
import './src/i18n';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet, View } from 'react-native';

import LoadingSpinner from './src/components/LoadingSpinner';
import { linking } from './src/navigation/linking';
import { navigationTheme } from './src/navigation/theme';
import { RootTabs } from './src/navigation/RootTabs';
import { colors } from './src/theme/colors';
import { useFavoritesStore } from './src/store/favoritesStore';
import { useLanguageStore } from './src/store/languageStore';

SplashScreen.preventAutoHideAsync().catch(() => {
  /* Beim Hot-Reload kann der Splash bereits ausgeblendet sein */
});

export default function App() {
  const favoritesHydrated = useFavoritesStore((state) => state.hasHydrated);
  const languageHydrated = useLanguageStore((state) => state.hasHydrated);
  const isReady = favoritesHydrated && languageHydrated;

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [isReady]);

  if (!isReady) {
    return (
      <View style={styles.boot}>
        <LoadingSpinner fullscreen />
        <StatusBar style="light" backgroundColor={colors.background} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <BottomSheetModalProvider>
        <SafeAreaProvider>
          <NavigationContainer theme={navigationTheme} linking={linking}>
            <StatusBar style="light" backgroundColor={colors.background} />
            <RootTabs />
          </NavigationContainer>
        </SafeAreaProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  boot: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
