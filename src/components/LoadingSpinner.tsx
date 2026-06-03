import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';

export interface LoadingSpinnerProps {
  /** Optionaler Lade-Text unter dem Spinner. */
  message?: string;
  size?: 'small' | 'large';
  /** Vollbild-Overlay (z. B. App-Start, lange Operationen). */
  fullscreen?: boolean;
}

function LoadingSpinner({ message, size = 'large', fullscreen = false }: LoadingSpinnerProps) {
  const { t } = useTranslation();
  const displayMessage = message ?? (fullscreen ? t('common.loading') : undefined);

  const content = (
    <>
      <ActivityIndicator size={size} color={colors.primary} />
      {displayMessage ? <Text style={styles.message}>{displayMessage}</Text> : null}
    </>
  );

  if (fullscreen) {
    return (
      <View
        style={styles.fullscreen}
        accessibilityRole="progressbar"
        accessibilityLabel={displayMessage}
      >
        <View style={styles.fullscreenInner}>{content}</View>
      </View>
    );
  }

  return (
    <View style={styles.inline} accessibilityRole="progressbar">
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  fullscreen: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 18, 18, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  fullscreenInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  inline: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.md,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default LoadingSpinner;
