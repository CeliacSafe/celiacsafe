import { Image } from 'expo-image';
import { StyleSheet, type ImageStyle, type StyleProp, type ViewStyle } from 'react-native';

import type { SupportedLanguage } from '../i18n';

const FLAG_SOURCES: Record<SupportedLanguage, number> = {
  es: require('../../assets/flags/es.png'),
  en: require('../../assets/flags/gb.png'),
  de: require('../../assets/flags/de.png'),
};

interface LanguageFlagProps {
  code: SupportedLanguage;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Sprach-Flagge als Bild (Emoji-Flaggen rendern auf Windows/Android oft nicht).
 */
function LanguageFlag({ code, size = 20, style }: LanguageFlagProps) {
  const height = size;
  const width = Math.round(size * 1.35);

  return (
    <Image
      source={FLAG_SOURCES[code]}
      style={[styles.flag, { width, height }, style as StyleProp<ImageStyle>]}
      contentFit="cover"
      accessibilityIgnoresInvertColors
    />
  );
}

const styles = StyleSheet.create({
  flag: {
    borderRadius: 3,
  },
});

export default LanguageFlag;
