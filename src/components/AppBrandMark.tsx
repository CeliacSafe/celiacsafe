import { StyleSheet, Text, View } from 'react-native';

import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { fontFamilies } from '../theme/fonts';

/** Kompaktes Wortmarke-Logo (Punkt + „celiacsafe“) wie in der Design-Vorlage. */
function AppBrandMark() {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.row} accessibilityRole="header" accessibilityLabel="CeliacSafe">
      <View style={styles.logoDot}>
        <View style={styles.logoDotAccent} />
      </View>
      <Text style={styles.wordmark}>
        celiac<Text style={styles.wordmarkAccent}>safe</Text>
      </Text>
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    logoDot: {
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: colors.primary,
    },
    logoDotAccent: {
      position: 'absolute',
      top: 1,
      right: -3,
      width: 9,
      height: 9,
      borderRadius: 5,
      backgroundColor: colors.accent,
    },
    wordmark: {
      fontFamily: fontFamilies.serif,
      fontSize: 18,
      letterSpacing: -0.36,
      color: colors.textPrimary,
    },
    wordmarkAccent: {
      fontFamily: fontFamilies.serifItalic,
      color: colors.primary,
    },
  });

export default AppBrandMark;
