import 'react-native-gesture-handler';

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

SplashScreen.preventAutoHideAsync().catch(() => {
  /* Beim Hot-Reload kann der Splash bereits ausgeblendet sein */
});

export default function App() {
  const hasHydrated = useFavoritesStore((state) => state.hasHydrated);

  useEffect(() => {
    if (hasHydrated) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [hasHydrated]);

  if (!hasHydrated) {
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
