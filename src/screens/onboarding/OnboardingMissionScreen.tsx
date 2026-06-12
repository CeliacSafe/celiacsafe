import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import AppBrandMark from '../../components/AppBrandMark';
import OnboardingLayout from '../../components/OnboardingLayout';
import type { OnboardingStackParamList } from '../../navigation/OnboardingStack';
import { useTheme } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { type AppColors } from '../../theme/palette';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'Mission'>;

export default function OnboardingMissionScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <OnboardingLayout
      step={1}
      title={t('onboarding.mission_title')}
      primaryLabel={t('onboarding.continue')}
      onPrimary={() => navigation.navigate('Verification')}
    >
      <AppBrandMark />
      <Text style={styles.body}>{t('onboarding.mission_body')}</Text>
      <View style={styles.highlightRow}>
        <MaterialCommunityIcons name="shield-check" size={22} color={colors.primary} />
        <Text style={styles.highlightText}>{t('onboarding.mission_highlight')}</Text>
      </View>
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
    highlightRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingTop: spacing.xs,
    },
    highlightText: {
      ...typography.body,
      flex: 1,
      color: colors.textPrimary,
      fontWeight: '600',
    },
  });
