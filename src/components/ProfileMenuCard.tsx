import { StyleSheet, View } from 'react-native';
import type { ReactElement } from 'react';

import { colors } from '../theme/colors';
import { SPACE_SM, SPACE_XL } from '../theme/spacing';

interface ProfileMenuCardProps {
  children: ReactElement | ReactElement[];
}

function ProfileMenuCard({ children }: ProfileMenuCardProps) {
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

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: SPACE_XL,
    marginVertical: SPACE_SM,
  },
  divider: {
    height: 1,
    backgroundColor: colors.background,
  },
});

export default ProfileMenuCard;
