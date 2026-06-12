import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { BuscarStackParamList } from '../navigation/BuscarStack';
import type { ComunidadStackParamList } from '../navigation/ComunidadStack';
import { BUG_REPORT_EMAIL_SUBJECT, ERRORS_EMAIL } from '../constants/appContact';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';
import { openEmail } from '../utils/openExternalUrl';

type NavigationProp = NativeStackNavigationProp<
  BuscarStackParamList & ComunidadStackParamList,
  'RestaurantDetail'
>;

interface DetailCommunityActionsProps {
  restaurantName: string;
}

function DetailCommunityActions({ restaurantName }: DetailCommunityActionsProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<NavigationProp>();

  const handleReport = () => {
    openEmail(ERRORS_EMAIL, `${BUG_REPORT_EMAIL_SUBJECT} — ${restaurantName}`);
  };

  const handleSuggestUpdate = () => {
    navigation.getParent()?.navigate('Perfil', { screen: 'SubmitRestaurant' });
  };

  return (
    <View style={styles.wrapper}>
      <Text style={styles.eyebrow}>{t('detail.community_eyebrow')}</Text>
      <Text style={styles.intro}>{t('detail.community_intro')}</Text>
      <View style={styles.actions}>
        <Pressable
          onPress={handleReport}
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, styles.buttonSecondary, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons name="alert-circle-outline" size={18} color={colors.primary} />
          <Text style={styles.buttonLabelSecondary}>{t('detail.community_report')}</Text>
        </Pressable>
        <Pressable
          onPress={handleSuggestUpdate}
          accessibilityRole="button"
          style={({ pressed }) => [styles.button, styles.buttonPrimary, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons name="store-plus-outline" size={18} color={colors.onPrimary} />
          <Text style={styles.buttonLabelPrimary}>{t('detail.community_reverify')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    wrapper: {
      marginHorizontal: spacing.screenPadding,
      marginTop: spacing.md,
      padding: spacing.md,
      borderRadius: radius.lg,
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.lineSoft,
      gap: spacing.sm,
    },
    eyebrow: {
      ...typography.overline,
      color: colors.primary,
    },
    intro: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      lineHeight: 20,
    },
    actions: {
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm + 2,
      paddingHorizontal: spacing.md,
      borderRadius: radius.pill,
    },
    buttonPrimary: {
      backgroundColor: colors.primary,
    },
    buttonSecondary: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pressed: {
      opacity: 0.88,
    },
    buttonLabelPrimary: {
      ...typography.button,
      color: colors.onPrimary,
    },
    buttonLabelSecondary: {
      ...typography.button,
      color: colors.primary,
    },
  });

export default DetailCommunityActions;
