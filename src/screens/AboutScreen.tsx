import { APP_VERSION_LABEL } from '../constants/appVersion';
import AboutTeamMember from '../components/AboutTeamMember';
import AppLogo from '../components/AppLogo';
import LegalSubScreenLayout, { LegalSectionBlock } from '../components/LegalSubScreenLayout';
import { BUG_REPORT_EMAIL_SUBJECT, CONTACT_EMAIL, ERRORS_EMAIL } from '../constants/appContact';
import { getShareUrl } from '../constants/storeUrls';
import type { PerfilStackParamList } from '../navigation/PerfilStack';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { fontFamilies } from '../theme/fonts';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';
import { openEmail } from '../utils/openExternalUrl';
import { requestAppStoreReview } from '../utils/rateApp';

import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useMemo } from 'react';
import { Platform, Pressable, Share, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

type AboutNavigationProp = NativeStackNavigationProp<PerfilStackParamList, 'About'>;

type HelpIconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface HelpAction {
  icon: HelpIconName;
  label: string;
  onPress: () => void;
}

function AboutScreen() {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const navigation = useNavigation<AboutNavigationProp>();
  const appVersion = APP_VERSION_LABEL;

  const handleShare = useCallback(async () => {
    const url = getShareUrl();
    const message = t('about.share_message', { url });
    if (Platform.OS === 'ios') {
      await Share.share({ message, url });
    } else {
      await Share.share({ message });
    }
  }, [t]);

  const helpActions: HelpAction[] = useMemo(
    () => [
      {
        icon: 'store-plus-outline',
        label: t('about.help_link_suggest'),
        onPress: () => navigation.navigate('SubmitRestaurant'),
      },
      {
        icon: 'alert-circle-outline',
        label: t('about.help_link_report'),
        onPress: () => openEmail(ERRORS_EMAIL, BUG_REPORT_EMAIL_SUBJECT),
      },
      {
        icon: 'email-outline',
        label: t('about.help_link_contact'),
        onPress: () => openEmail(CONTACT_EMAIL),
      },
      {
        icon: 'shield-account-outline',
        label: t('about.help_link_privacy'),
        onPress: () => navigation.navigate('Privacy'),
      },
      {
        icon: 'star-outline',
        label: t('about.help_link_rate'),
        onPress: () => {
          requestAppStoreReview().catch(() => undefined);
        },
      },
      {
        icon: 'share-variant-outline',
        label: t('about.help_link_share'),
        onPress: () => {
          handleShare().catch(() => undefined);
        },
      },
    ],
    [handleShare, navigation, t]
  );

  return (
    <LegalSubScreenLayout title={t('about.title')}>
      <View style={styles.hero}>
        <AppLogo width={280} style={styles.logo} />
        <Text style={styles.heroTitle}>{t('about.hero_title')}</Text>
        <Text style={styles.heroSubtitle}>{t('about.hero_subtitle')}</Text>
      </View>

      <LegalSectionBlock title={t('about.story_eyebrow')} body={t('about.story_body')} />

      <View style={styles.methodologyBlock}>
        <Text style={styles.eyebrow}>{t('about.methodology_eyebrow')}</Text>
        <Text style={styles.methodologyLead}>{t('about.methodology_lead')}</Text>
        <Text style={styles.bodyText}>{t('about.methodology_body')}</Text>
      </View>

      <View style={styles.teamBlock}>
        <Text style={styles.eyebrow}>{t('about.team_eyebrow')}</Text>
        <AboutTeamMember
          initials="SA"
          name={t('about.team_stephan_name')}
          role={t('about.team_stephan_role')}
          bio={t('about.team_stephan_bio')}
          color={colors.primary}
        />
        <AboutTeamMember
          initials="VG"
          name={t('about.team_victoria_name')}
          role={t('about.team_victoria_role')}
          bio={t('about.team_victoria_bio')}
          color={colors.accent}
        />
        <Text style={styles.teamNote}>{t('about.team_community_note')}</Text>
      </View>

      <LegalSectionBlock title={t('about.principles_eyebrow')} body={t('about.principles_body')} />
      <LegalSectionBlock title={t('about.contact_eyebrow')} body={t('about.contact_body')} />

      <View style={styles.helpBlock}>
        <Text style={styles.helpHeading}>{t('about.help_title')}</Text>
        <View style={styles.helpCard}>
          {helpActions.map((action, index) => (
            <View key={action.label}>
              <Pressable
                onPress={action.onPress}
                accessibilityRole="button"
                accessibilityLabel={action.label}
                style={({ pressed }) => [styles.helpRow, pressed && styles.helpRowPressed]}
              >
                <MaterialCommunityIcons name={action.icon} size={22} color={colors.primary} />
                <Text style={styles.helpLabel}>{action.label}</Text>
                <MaterialCommunityIcons
                  name="chevron-right"
                  size={22}
                  color={colors.textSecondary}
                />
              </Pressable>
              {index < helpActions.length - 1 ? <View style={styles.helpDivider} /> : null}
            </View>
          ))}
        </View>
      </View>

      <View style={styles.versionBox}>
        <MaterialCommunityIcons name="cellphone" size={22} color={colors.primary} />
        <Text style={styles.versionText}>{t('about.version_label', { version: appVersion })}</Text>
      </View>
    </LegalSubScreenLayout>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  logo: {
    marginBottom: spacing.xs,
  },
  heroTitle: {
    fontFamily: fontFamilies.serifRegular,
    fontSize: 22,
    lineHeight: 28,
    color: colors.textPrimary,
    textAlign: 'center',
    paddingHorizontal: spacing.cardPadding,
  },
  heroSubtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: spacing.cardPadding,
  },
  eyebrow: {
    ...typography.overline,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  methodologyBlock: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  methodologyLead: {
    fontFamily: fontFamilies.serifItalic,
    fontSize: 20,
    lineHeight: 26,
    color: colors.accent,
  },
  bodyText: {
    ...typography.body,
    color: colors.textPrimary,
    lineHeight: 24,
  },
  teamBlock: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  teamNote: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontStyle: 'italic',
    marginTop: spacing.xs,
  },
  helpBlock: {
    gap: spacing.md,
  },
  helpHeading: {
    ...typography.h3,
    fontWeight: '700',
    color: colors.primary,
  },
  helpCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.cardPadding,
    paddingVertical: spacing.sm + spacing.xs,
    paddingHorizontal: spacing.md,
  },
  helpRowPressed: {
    opacity: 0.85,
  },
  helpLabel: {
    ...typography.h4,
    flex: 1,
    color: colors.textPrimary,
  },
  helpDivider: {
    height: 1,
    backgroundColor: colors.background,
  },
  versionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.cardPadding,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.screenPadding,
    marginTop: spacing.sm,
  },
  versionText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
  },
});

export default AboutScreen;
