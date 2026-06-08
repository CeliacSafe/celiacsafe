import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  PROFILE_MENU_CHEVRON_SIZE,
  PROFILE_MENU_ICON_SIZE,
  createProfileMenuStyles,
} from './profileMenuStyles';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface ProfileMenuRowProps {
  icon: IconName;
  label: string;
  onPress?: () => void;
  showChevron?: boolean;
  disabled?: boolean;
}

function ProfileMenuRow({
  icon,
  label,
  onPress,
  showChevron = true,
  disabled = false,
}: ProfileMenuRowProps) {
  const { colors } = useTheme();
  const profileMenuStyles = useThemedStyles(createProfileMenuStyles);
  const styles = useThemedStyles(createStyles);
  const interactive = Boolean(onPress) && !disabled;

  return (
    <Pressable
      onPress={onPress}
      disabled={!interactive}
      accessibilityRole={interactive ? 'button' : 'text'}
      accessibilityLabel={label}
      accessibilityState={{ disabled: !interactive }}
      style={({ pressed }) => [
        profileMenuStyles.row,
        pressed && interactive && profileMenuStyles.rowPressed,
      ]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={PROFILE_MENU_ICON_SIZE}
        color={disabled ? colors.textSecondary : colors.primary}
      />
      <Text style={[profileMenuStyles.label, disabled && styles.labelDisabled]}>{label}</Text>
      {showChevron && interactive ? (
        <MaterialCommunityIcons
          name="chevron-right"
          size={PROFILE_MENU_CHEVRON_SIZE}
          color={colors.textSecondary}
        />
      ) : (
        <View style={profileMenuStyles.chevronSpacer} />
      )}
    </Pressable>
  );
}

interface ProfileMenuStaticRowProps {
  icon: IconName;
  label: string;
}

/** Statische Zeile ohne Tap (z. B. Versionsnummer). */
export function ProfileMenuStaticRow({ icon, label }: ProfileMenuStaticRowProps) {
  const { colors } = useTheme();
  const profileMenuStyles = useThemedStyles(createProfileMenuStyles);
  return (
    <View style={profileMenuStyles.row} accessibilityRole="text" accessibilityLabel={label}>
      <MaterialCommunityIcons name={icon} size={PROFILE_MENU_ICON_SIZE} color={colors.primary} />
      <Text style={profileMenuStyles.labelMuted}>{label}</Text>
      <View style={profileMenuStyles.chevronSpacer} />
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  labelDisabled: {
    color: colors.textSecondary,
    opacity: 0.5,
  },
});

export default ProfileMenuRow;
