import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import OnboardingLayout from '../../components/OnboardingLayout';
import { useUserLocation } from '../../hooks/useUserLocation';
import { useOnboardingStore } from '../../store/onboardingStore';
import { useTheme } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { type AppColors } from '../../theme/palette';
import { spacing, radius } from '../../theme/spacing';
import { typography } from '../../theme/typography';

export default function OnboardingLocationScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const completeOnboarding = useOnboardingStore((state) => state.completeOnboarding);
  const { requestLocation, loading } = useUserLocation();

  const finish = () => {
    completeOnboarding();
  };

  const enableLocation = async () => {
    await requestLocation().catch(() => undefined);
    finish();
  };

  return (
    <OnboardingLayout
      step={3}
      title={t('onboarding.location_title')}
      primaryLabel={
        loading ? t('onboarding.location_requesting') : t('onboarding.location_enable')
      }
      onPrimary={enableLocation}
      secondaryLabel={t('onboarding.location_skip')}
      onSecondary={finish}
    >
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name="crosshairs-gps" size={40} color={colors.primary} />
      </View>
      <Text style={styles.body}>{t('onboarding.location_body')}</Text>
      {Platform.OS === 'web' ? (
        <Text style={styles.hint}>{t('onboarding.location_web_hint')}</Text>
      ) : null}
    </OnboardingLayout>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: radius.pill,
      backgroundColor: colors.surfaceAlt,
      alignItems: 'center',
      justifyContent: 'center',
      alignSelf: 'center',
    },
    body: {
      ...typography.body,
      color: colors.textSecondary,
      lineHeight: 24,
      textAlign: 'center',
    },
    hint: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
