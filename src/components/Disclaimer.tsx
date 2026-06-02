import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { AppLanguage } from '../i18n/getLocalizedName';
import { colors } from '../theme/colors';
import { RADIUS_SUB } from '../theme/radii';
import { SPACE_LG, SPACE_XL } from '../theme/spacing';

interface DisclaimerProps {
  language?: AppLanguage;
  variant?: 'full' | 'short';
}

const DISCLAIMER_TEXTS: Record<AppLanguage, { full: string; short: string }> = {
  es: {
    full: 'Esta app proporciona información orientativa sobre restaurantes que se autodeclaran 100% sin gluten o están certificados por asociaciones de celíacos. Los responsables de la app no garantizan la exactitud, actualidad o seguridad alimentaria de cada establecimiento. Se recomienda confirmar siempre con el establecimiento antes de consumir.',
    short: 'Información orientativa. Confirme siempre con el restaurante.',
  },
  en: {
    full: 'This app provides indicative information about restaurants that self-declare as 100% gluten-free or are certified by coeliac associations. The app operators do not guarantee the accuracy, timeliness, or food safety of each establishment. We recommend always confirming with the restaurant before eating.',
    short: 'Indicative information only. Always confirm with the restaurant.',
  },
  de: {
    full: 'Diese App stellt Orientierungshilfen zu Restaurants bereit, die sich als 100 % glutenfrei deklarieren oder von Zöliakie-Vereinigungen zertifiziert sind. Die Betreiber übernehmen keine Garantie für die Richtigkeit, Aktualität oder Lebensmittelsicherheit der einzelnen Betriebe. Bitte bestätigen Sie vor dem Verzehr immer direkt beim Restaurant.',
    short: 'Nur Orientierungshinweise. Bitte immer beim Restaurant nachfragen.',
  },
};

function Disclaimer({ language = 'es', variant = 'full' }: DisclaimerProps) {
  const text = DISCLAIMER_TEXTS[language][variant];

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <MaterialCommunityIcons
          name="information-outline"
          size={20}
          color={colors.warning}
          style={styles.icon}
        />
        <Text style={styles.text}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: SPACE_XL,
    paddingVertical: SPACE_XL,
  },
  container: {
    backgroundColor: colors.surface,
    padding: SPACE_LG,
    borderRadius: RADIUS_SUB,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  icon: {
    marginBottom: SPACE_LG,
  },
  text: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
});

export default Disclaimer;
