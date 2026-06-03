import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

import { typography } from '../theme/typography';
interface ProfileSectionProps {
  title: string;
  children: ReactNode;
}

function ProfileSection({ title, children }: ProfileSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
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
