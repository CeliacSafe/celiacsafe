import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';

interface OnboardingLayoutProps {
  step: 1 | 2 | 3;
  title: string;
  children: ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}

function OnboardingLayout({
  step,
  title,
  children,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: OnboardingLayoutProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.body}>
        <View style={styles.progressRow} accessibilityRole="progressbar">
          {[1, 2, 3].map((dot) => (
            <View
              key={dot}
              style={[styles.dot, dot <= step ? styles.dotActive : styles.dotInactive]}
              accessibilityLabel={t('onboarding.step_indicator', { current: step, total: 3 })}
            />
          ))}
        </View>

        <Text style={styles.title}>{title}</Text>
        <View style={styles.content}>{children}</View>
      </View>

      <View style={styles.footer}>
        <Pressable
          onPress={onPrimary}
          accessibilityRole="button"
          style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryPressed]}
        >
          <Text style={styles.primaryLabel}>{primaryLabel}</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color={colors.onPrimary} />
        </Pressable>

        {secondaryLabel && onSecondary ? (
          <Pressable
            onPress={onSecondary}
            accessibilityRole="button"
            style={({ pressed }) => [styles.secondaryButton, pressed && styles.secondaryPressed]}
          >
            <Text style={styles.secondaryLabel}>{secondaryLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: colors.background,
    },
    body: {
      flex: 1,
      paddingHorizontal: spacing.screenPadding,
      paddingTop: spacing.lg,
    },
    progressRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.xl,
    },
    dot: {
      flex: 1,
      height: 4,
      borderRadius: radius.pill,
    },
    dotActive: {
      backgroundColor: colors.primary,
    },
    dotInactive: {
      backgroundColor: colors.lineSoft,
    },
    title: {
      ...typography.h2,
      color: colors.textPrimary,
      marginBottom: spacing.md,
    },
    content: {
      flex: 1,
      gap: spacing.md,
    },
    footer: {
      paddingHorizontal: spacing.screenPadding,
      paddingBottom: spacing.md,
      gap: spacing.sm,
    },
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: colors.primary,
      borderRadius: radius.pill,
      paddingVertical: spacing.md,
    },
    primaryPressed: {
      opacity: 0.9,
    },
    primaryLabel: {
      ...typography.button,
      color: colors.onPrimary,
    },
    secondaryButton: {
      alignItems: 'center',
      paddingVertical: spacing.sm,
    },
    secondaryPressed: {
      opacity: 0.85,
    },
    secondaryLabel: {
      ...typography.body,
      color: colors.textSecondary,
      fontWeight: '600',
    },
  });

export default OnboardingLayout;
