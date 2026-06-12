import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import OnboardingLayout from '../../components/OnboardingLayout';
import type { OnboardingStackParamList } from '../../navigation/OnboardingStack';
import { useTheme } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { type AppColors } from '../../theme/palette';
import { spacing, radius } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'Verification'>;

const VERIFICATION_ITEMS = [
  { icon: 'eye-check' as const, labelKey: 'onboarding.verify_visit' },
  { icon: 'certificate' as const, labelKey: 'onboarding.verify_cert' },
  { icon: 'storefront' as const, labelKey: 'onboarding.verify_declaration' },
] as const;

export default function OnboardingVerificationScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <OnboardingLayout
      step={2}
      title={t('onboarding.verification_title')}
      primaryLabel={t('onboarding.continue')}
      onPrimary={() => navigation.navigate('Location')}
    >
      <Text style={styles.body}>{t('onboarding.verification_body')}</Text>
      <View style={styles.list}>
        {VERIFICATION_ITEMS.map((item) => (
          <View key={item.labelKey} style={styles.row}>
            <View style={styles.iconWrap}>
              <MaterialCommunityIcons name={item.icon} size={20} color={colors.primary} />
            </View>
            <Text style={styles.rowLabel}>{t(item.labelKey)}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.disclaimer}>{t('onboarding.verification_disclaimer')}</Text>
    </OnboardingLayout>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    body: {
      ...typography.body,
      color: colors.textSecondary,
      lineHeight: 24,
    },
    list: {
      gap: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: colors.surfaceAlt,
      borderRadius: radius.lg,
      padding: spacing.md,
    },
    iconWrap: {
      width: 36,
      height: 36,
      borderRadius: radius.pill,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rowLabel: {
      ...typography.body,
      flex: 1,
      color: colors.textPrimary,
      fontWeight: '600',
    },
    disclaimer: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
  });
