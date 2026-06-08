import { StyleSheet, View } from 'react-native';
import type { ReactElement } from 'react';

import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { spacing, radius } from '../theme/spacing';

interface ProfileMenuCardProps {
  children: ReactElement | ReactElement[];
}

function ProfileMenuCard({ children }: ProfileMenuCardProps) {
  const styles = useThemedStyles(createStyles);
  const items = Array.isArray(children) ? children : [children];

  return (
    <View style={styles.card}>
      {items.map((child, index) => (
        <View key={index}>
          {child}
          {index < items.length - 1 ? <View style={styles.divider} /> : null}
        </View>
      ))}
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginHorizontal: spacing.screenPadding,
    marginVertical: spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: colors.background,
  },
});

export default ProfileMenuCard;
