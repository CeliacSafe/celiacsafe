import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { AppLanguage } from '../i18n/getLocalizedName';
import { colors } from '../theme/colors';
import { RADIUS_INPUT } from '../theme/radii';
import { SPACE_MD, SPACE_SM, SPACE_XL } from '../theme/spacing';
import type { Restaurant } from '../types/Restaurant';

interface SeasonalClosureBannerProps {
  restaurant: Restaurant;
  language?: AppLanguage;
}

const PREFIX: Record<AppLanguage, string> = {
  es: 'Cierre estacional:',
  en: 'Seasonal closure:',
  de: 'Saisonal geschlossen:',
};

/**
 * Auffaelliger Hinweis bei saisonaler Schliessung.
 */
function SeasonalClosureBanner({ restaurant, language = 'es' }: SeasonalClosureBannerProps) {
  const closure = restaurant.seasonal_closure?.trim();

  if (!closure) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <MaterialCommunityIcons name="alert" size={20} color={colors.background} />
        <Text style={styles.text}>
          {PREFIX[language]} {closure}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: SPACE_XL,
    paddingVertical: SPACE_SM,
  },
  container: {
    backgroundColor: colors.warning,
    borderRadius: RADIUS_INPUT,
    padding: SPACE_MD,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACE_SM,
  },
  text: {
    flex: 1,
    color: colors.background,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
});

export default SeasonalClosureBanner;
