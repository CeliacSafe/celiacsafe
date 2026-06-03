import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '../theme/colors';
import { RADIUS_SUB } from '../theme/radii';
import { SPACE_LG, SPACE_XL } from '../theme/spacing';

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
    paddingHorizontal: SPACE_XL,
    paddingVertical: SPACE_XL,
  },
  container: {
    backgroundColor: colors.surface,
    padding: SPACE_LG,
    borderRadius: RADIUS_SUB,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  embeddedContainer: {
    backgroundColor: colors.surface,
    padding: SPACE_LG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.warning,
  },
  icon: {
    marginBottom: SPACE_LG,
  },
  text: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
});

export default Disclaimer;

// i18n-migrated
