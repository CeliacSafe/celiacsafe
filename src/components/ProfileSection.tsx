import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { SPACE_SM, SPACE_XXL } from '../theme/spacing';

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
    marginBottom: SPACE_SM,
  },
  sectionTitle: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    paddingHorizontal: SPACE_XXL,
    paddingTop: SPACE_XXL,
    paddingBottom: SPACE_SM,
  },
});

export default ProfileSection;
