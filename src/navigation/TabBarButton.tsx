import type { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import { StyleSheet, View } from 'react-native';

import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { radius, spacing } from '../theme/spacing';
import { hapticLight } from '../utils/haptics';

/** Tab-Taste mit Haptik und aktivem Sage-Indikator (Design-Vorlage). */
export default function TabBarButton(props: BottomTabBarButtonProps) {
  const focused = props.accessibilityState?.selected === true;
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.wrap}>
      {focused ? <View style={styles.indicator} /> : null}
      <PlatformPressable
        {...props}
        style={[props.style, styles.button]}
        onPress={(event) => {
          hapticLight();
          props.onPress?.(event);
        }}
      />
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    wrap: {
      flex: 1,
      alignItems: 'center',
    },
    indicator: {
      position: 'absolute',
      top: 0,
      width: spacing.lg,
      height: 2,
      borderRadius: radius.pill,
      backgroundColor: colors.primary,
    },
    button: {
      flex: 1,
      width: '100%',
    },
  });
