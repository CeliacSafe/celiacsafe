import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { spacing } from '../theme/spacing';

import { typography } from '../theme/typography';
interface ProfileSectionProps {
  title: string;
  children: ReactNode;
}

function ProfileSection({ title, children }: ProfileSectionProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  section: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.overline,
    color: colors.textSecondary,
    paddingHorizontal: spacing.sectionGap,
    paddingTop: spacing.sectionGap,
    paddingBottom: spacing.sm,
  },
});

export default ProfileSection;
