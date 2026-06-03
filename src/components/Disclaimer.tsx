import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '../theme/colors';
import { spacing, radius } from '../theme/spacing';

import { typography } from '../theme/typography';

interface DisclaimerProps {
  variant?: 'full' | 'short';
  /** Ohne aeussere Screen-Padding (z. B. im Profil-Tab). */
  embedded?: boolean;
}

function Disclaimer({ variant = 'full', embedded = false }: DisclaimerProps) {
  const { t } = useTranslation();
  const text = t(variant === 'full' ? 'disclaimer.full' : 'disclaimer.short');

  const content = (
    <>
      <MaterialCommunityIcons
        name="information-outline"
        size={20}
        color={colors.warning}
        style={styles.icon}
      />
      <Text style={styles.text}>{text}</Text>
    </>
  );

  if (embedded) {
    return <View style={styles.embeddedContainer}>{content}</View>;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>{content}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.screenPadding,
  },
  container: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  embeddedContainer: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  icon: {
    marginBottom: spacing.md,
  },
  text: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});

export default Disclaimer;

// i18n-migrated
