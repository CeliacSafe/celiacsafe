import 'react-native-gesture-handler';
import './src/i18n';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

import { RootTabs } from './src/navigation/RootTabs';
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
    return null;
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <BottomSheetModalProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <RootTabs />
            <StatusBar style="light" />
          </NavigationContainer>
        </SafeAreaProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
