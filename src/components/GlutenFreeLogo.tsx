import { Image } from 'expo-image';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

const APP_ICON = require('../../assets/icon.png');

interface GlutenFreeLogoProps {
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/** App-Logo: Glutenfrei-Symbol (Weizenähre mit Durchstreichung). */
function GlutenFreeLogo({ size = 40, style }: GlutenFreeLogoProps) {
  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: size * 0.22 }, style]}>
      <Image
        source={APP_ICON}
        style={{ width: size, height: size }}
        contentFit="contain"
        accessibilityIgnoresInvertColors
        accessibilityRole="image"
        accessibilityLabel="Celiac Safe"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
});

export default GlutenFreeLogo;
