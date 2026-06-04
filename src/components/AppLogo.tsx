import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

/** Horizontales CeliacSafe-Markenlogo (Bild mit Icon + Text). */
const BRAND_LOGO = require('../../assets/brand/celiacsafe-logo.png');

/** Breite/Höhe des Quellbildes — für korrektes Seitenverhältnis */
const LOGO_ASPECT = 1024 / 558;

interface AppLogoProps {
  /** Breite in px; Höhe folgt aus dem Seitenverhältnis */
  width?: number;
  style?: StyleProp<ViewStyle>;
}

function AppLogo({ width = 220, style }: AppLogoProps) {
  const height = Math.round(width / LOGO_ASPECT);

  return (
    <View style={[styles.wrap, { width, height }, style]}>
      <Image
        source={BRAND_LOGO}
        style={styles.image}
        contentFit="contain"
        accessibilityIgnoresInvertColors
        accessibilityRole="image"
        accessibilityLabel="CeliacSafe"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});

export default AppLogo;
