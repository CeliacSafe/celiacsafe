import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { spacing, radius } from '../theme/spacing';

import { typography } from '../theme/typography';

type BadgeVariant = 'sinGluten' | 'verified' | 'premium' | 'priceRange' | 'cuisine' | 'neutral';

interface BadgePillProps {
  label: string;
  variant?: BadgeVariant;
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
}

type VariantStyle = {
  backgroundColor: string;
  textColor: string;
  iconColor: string;
};

const getVariantStyles = (colors: AppColors): Record<BadgeVariant, VariantStyle> => ({
  sinGluten: {
    backgroundColor: colors.overlay,
    textColor: colors.primary,
    iconColor: colors.primary,
  },
  verified: {
    backgroundColor: colors.overlay,
    textColor: colors.primary,
    iconColor: colors.primary,
  },
  premium: {
    backgroundColor: colors.premiumBg,
    textColor: colors.premiumText,
    iconColor: colors.premiumText,
  },
  priceRange: {
    backgroundColor: colors.overlay,
    textColor: colors.textPrimary,
    iconColor: colors.textPrimary,
  },
  cuisine: {
    backgroundColor: colors.surfaceAlt,
    textColor: colors.textSecondary,
    iconColor: colors.textSecondary,
  },
  neutral: {
    backgroundColor: colors.overlay,
    textColor: colors.textPrimary,
    iconColor: colors.textPrimary,
  },
});

function BadgePill({ label, variant = 'neutral', iconName }: BadgePillProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const scheme = getVariantStyles(colors)[variant];

  return (
    <View style={[styles.pill, { backgroundColor: scheme.backgroundColor }]}>
      {iconName ? (
        <MaterialCommunityIcons
          name={iconName}
          size={12}
          color={scheme.iconColor}
          style={styles.icon}
        />
      ) : null}
      <Text style={[styles.label, { color: scheme.textColor }]}>{label}</Text>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.cardPadding,
  },
  icon: {
    marginRight: spacing.xs,
  },
  label: {
    ...typography.badge,
  },
});

export default BadgePill;
