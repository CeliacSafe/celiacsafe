import { APP_VERSION_LABEL } from '../constants/appVersion';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useRef } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import Disclaimer from '../components/Disclaimer';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ProfileDietaryPreferences from '../components/ProfileDietaryPreferences';
import ProfileMenuCard from '../components/ProfileMenuCard';
import ProfileMenuRow, { ProfileMenuStaticRow } from '../components/ProfileMenuRow';
import ProfileSection from '../components/ProfileSection';
import RateAppButton from '../components/RateAppButton';
import ShareAppButton from '../components/ShareAppButton';
import ThemeSwitcher from '../components/ThemeSwitcher';
import { BUG_REPORT_EMAIL_SUBJECT, CONTACT_EMAIL, ERRORS_EMAIL } from '../constants/appContact';
import { ADMIN_UNLOCK_TAPS, IN_APP_ADMIN_ENABLED } from '../constants/adminConfig';
import type { PerfilStackParamList } from '../navigation/PerfilStack';
import { useThemedStyles } from '../theme/useThemedStyles';
import { useTheme } from '../theme/ThemeContext';
import { type AppColors } from '../theme/palette';
import { fontFamilies } from '../theme/fonts';
import { spacing, radius } from '../theme/spacing';

import { typography } from '../theme/typography';
import { openEmail } from '../utils/openExternalUrl';

type PerfilNavigationProp = NativeStackNavigationProp<PerfilStackParamList, 'PerfilMain'>;

function PerfilScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<PerfilNavigationProp>();
  const styles = useThemedStyles(createStyles);
  const appVersion = APP_VERSION_LABEL;
  const adminTapCount = useRef(0);
  const adminTapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleVersionPress = () => {
    if (!IN_APP_ADMIN_ENABLED) {
      return;
    }
    adminTapCount.current += 1;
    if (adminTapTimer.current) {
      clearTimeout(adminTapTimer.current);
    }
    adminTapTimer.current = setTimeout(() => {
      adminTapCount.current = 0;
    }, 2000);

    if (adminTapCount.current >= ADMIN_UNLOCK_TAPS) {
      adminTapCount.current = 0;
      navigation.navigate('AdminLogin');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroHeader}>
          <Text style={styles.greetingMeta}>{t('profile.greeting_meta')}</Text>
          <Text style={styles.greetingTitle}>
            {t('profile.greeting_line1')}
            <Text style={styles.greetingAccent}>{t('profile.greeting_accent')}</Text>
          </Text>
          <Text style={styles.greetingSub}>{t('profile.greeting_sub')}</Text>
        </View>

        <Pressable
          onPress={() => navigation.navigate('SubmitRestaurant')}
          accessibilityRole="button"
          style={({ pressed }) => [styles.contributeCard, pressed && styles.contributeCardPressed]}
        >
          <Text style={styles.contributeEyebrow}>{t('profile.hero_eyebrow')}</Text>
          <Text style={styles.contributeTitle}>{t('profile.hero_title')}</Text>
          <View style={styles.contributeCtaRow}>
            <Text style={styles.contributeCta}>{t('profile.hero_cta')}</Text>
            <MaterialCommunityIcons name="arrow-right" size={16} color={colors.onPrimary} />
          </View>
        </Pressable>
        <ProfileSection title={t('profile.language')}>
          <View style={styles.languageCardWrap}>
            <LanguageSwitcher variant="full" />
          </View>
        </ProfileSection>

        <ProfileSection title={t('profile.appearance')}>
          <View style={styles.languageCardWrap}>
            <ThemeSwitcher />
          </View>
        </ProfileSection>

        <ProfileSection title={t('profile.section_dietary')}>
          <View style={styles.languageCardWrap}>
            <ProfileDietaryPreferences />
          </View>
        </ProfileSection>

        <ProfileSection title={t('profile.section_contribute')}>
          <ProfileMenuCard>
            <ProfileMenuRow
              icon="food-fork-drink"
              label={t('profile.submit_restaurant')}
              onPress={() => navigation.navigate('SubmitRestaurant')}
            />
            <ProfileMenuRow
              icon="alert-circle-outline"
              label={t('profile.report_error')}
              onPress={() => openEmail(ERRORS_EMAIL, BUG_REPORT_EMAIL_SUBJECT)}
            />
          </ProfileMenuCard>
        </ProfileSection>

        <ProfileSection title={t('profile.section_about')}>
          <ProfileMenuCard>
            <ProfileMenuRow
              icon="information-outline"
              label={t('profile.about')}
              onPress={() => navigation.navigate('About')}
            />
            <Pressable onPress={handleVersionPress}>
              <ProfileMenuStaticRow
                icon="cellphone"
                label={t('profile.version', { version: appVersion })}
              />
            </Pressable>
          </ProfileMenuCard>
        </ProfileSection>

        <ProfileSection title={t('profile.section_legal')}>
          <ProfileMenuCard>
            <ProfileMenuRow
              icon="shield-account-outline"
              label={t('profile.privacy')}
              onPress={() => navigation.navigate('Privacy')}
            />
            <ProfileMenuRow
              icon="text-box-outline"
              label={t('profile.impressum')}
              onPress={() => navigation.navigate('Impressum')}
            />
          </ProfileMenuCard>
          <View style={styles.disclaimerWrap}>
            <Disclaimer variant="full" embedded />
          </View>
        </ProfileSection>

        <ProfileSection title={t('profile.section_rate_share')}>
          <ProfileMenuCard>
            <RateAppButton variant="plain" />
            <ShareAppButton variant="plain" />
            <ProfileMenuRow
              icon="email-outline"
              label={t('profile.contact')}
              onPress={() => openEmail(CONTACT_EMAIL)}
            />
          </ProfileMenuCard>
        </ProfileSection>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: spacing.sectionGap,
    },
    heroHeader: {
      paddingHorizontal: spacing.screenPadding,
      paddingTop: spacing.md,
      paddingBottom: spacing.md,
      gap: spacing.sm,
    },
    greetingMeta: {
      fontFamily: fontFamilies.mono,
      fontSize: 10,
      letterSpacing: 1.4,
      textTransform: 'uppercase',
      color: colors.primary,
    },
    greetingTitle: {
      fontFamily: fontFamilies.serifRegular,
      fontSize: 30,
      lineHeight: 33,
      letterSpacing: -0.6,
      color: colors.textPrimary,
    },
    greetingAccent: {
      fontFamily: fontFamilies.serifItalic,
      color: colors.primary,
    },
    greetingSub: {
      ...typography.bodySmall,
      color: colors.textSecondary,
    },
    contributeCard: {
      marginHorizontal: spacing.screenPadding,
      marginBottom: spacing.lg,
      borderRadius: radius.xl,
      backgroundColor: colors.primary,
      padding: spacing.lg,
      gap: spacing.sm,
      overflow: 'hidden',
    },
    contributeCardPressed: {
      opacity: 0.92,
    },
    contributeEyebrow: {
      fontFamily: fontFamilies.mono,
      fontSize: 10,
      letterSpacing: 1.4,
      textTransform: 'uppercase',
      color: colors.onPrimary,
      opacity: 0.85,
    },
    contributeTitle: {
      fontFamily: fontFamilies.serif,
      fontSize: 20,
      lineHeight: 24,
      letterSpacing: -0.4,
      color: colors.onPrimary,
    },
    contributeCtaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginTop: spacing.xs,
    },
    contributeCta: {
      ...typography.button,
      color: colors.onPrimary,
    },
    languageCardWrap: {
      marginHorizontal: spacing.screenPadding,
      marginVertical: spacing.sm,
    },
    disclaimerWrap: {
      marginHorizontal: spacing.screenPadding,
      marginTop: spacing.sm,
      marginBottom: spacing.sm,
    },
  });

export default PerfilScreen;
