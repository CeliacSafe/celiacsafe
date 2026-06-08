import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { radius, spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export type EmptyStateIllustration = 'default' | 'search' | 'favorites' | 'map';

export interface EmptyStateProps {
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  /**
   * Visuelle Variante: `default` = Icon oben; andere = thematisches Icon
   * (Platzhalter bis optionale SVG-Illustrationen eingebunden sind).
   */
  illustration?: EmptyStateIllustration;
  /** Weniger Mindesthoehe in Listen (FlatList ListEmptyComponent). */
  inline?: boolean;
  style?: StyleProp<ViewStyle>;
}

const ILLUSTRATION_ICON: Record<
  Exclude<EmptyStateIllustration, 'default'>,
  keyof typeof MaterialCommunityIcons.glyphMap
> = {
  search: 'magnify-close',
  favorites: 'heart-off-outline',
  map: 'map-marker-off-outline',
};

const ICON_SIZE = 96;

function EmptyState({
  iconName,
  title,
  description,
  actionLabel,
  onAction,
  illustration = 'default',
  inline = false,
  style,
}: EmptyStateProps) {
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const showThemedIllustration = illustration !== 'default';
  const displayIcon = showThemedIllustration ? ILLUSTRATION_ICON[illustration] : iconName;

  return (
    <View style={[styles.container, inline && styles.containerInline, style]}>
      <MaterialCommunityIcons
        name={displayIcon}
        size={ICON_SIZE}
        color={colors.textSecondary}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
        >
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.xl,
    minHeight: 280,
  },
  containerInline: {
    flex: undefined,
    minHeight: 220,
    paddingVertical: spacing.sectionGap,
  },
  title: {
    ...typography.h3,
    paddingTop: spacing.md,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  description: {
    ...typography.body,
    marginTop: spacing.sm,
    maxWidth: 280,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  actionButton: {
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  actionPressed: {
    opacity: 0.88,
  },
  actionLabel: {
    ...typography.button,
    color: colors.onPrimary,
  },
});

export default EmptyState;
