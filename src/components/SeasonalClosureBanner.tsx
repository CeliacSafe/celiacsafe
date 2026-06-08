import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { spacing, radius } from '../theme/spacing';

import { typography } from '../theme/typography';
import type { Restaurant } from '../types/Restaurant';

interface SeasonalClosureBannerProps {
  restaurant: Restaurant;
}

function SeasonalClosureBanner({ restaurant }: SeasonalClosureBannerProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const closure = restaurant.seasonal_closure?.trim();

  if (!closure) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <MaterialCommunityIcons name="alert" size={20} color={colors.onWarning} />
        <Text style={styles.text}>{t('detail.seasonal_closure', { period: closure })}</Text>
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.sm,
  },
  container: {
    backgroundColor: colors.warning,
    borderRadius: radius.lg,
    padding: spacing.cardPadding,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  text: {
    ...typography.bodySmall,
    flex: 1,
    fontWeight: '600',
    color: colors.onWarning,
  },
});

export default SeasonalClosureBanner;

// i18n-migrated
