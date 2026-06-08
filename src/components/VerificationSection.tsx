import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppLanguage } from '../i18n/useAppLanguage';
import type { AppLanguage } from '../i18n/getLocalizedName';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { spacing, radius } from '../theme/spacing';

import { typography } from '../theme/typography';
import type { Restaurant, VerificationMethod } from '../types/Restaurant';
import { useFormatDate } from '../utils/formatDate';

interface VerificationSectionProps {
  restaurant: Restaurant;
}

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const VERIFICATION_LABELS: Record<
  VerificationMethod,
  { es: string; en: string; de: string; icon: IconName }
> = {
  own_visit: {
    icon: 'eye-check',
    es: 'Visita propia',
    en: 'Personal visit',
    de: 'Eigener Besuch',
  },
  phone_confirmed: {
    icon: 'phone-check',
    es: 'Confirmado por teléfono',
    en: 'Confirmed by phone',
    de: 'Telefonisch bestätigt',
  },
  email_confirmed: {
    icon: 'email-check',
    es: 'Confirmado por email',
    en: 'Confirmed by email',
    de: 'Per E-Mail bestätigt',
  },
  face_certified: {
    icon: 'certificate',
    es: 'Programa FACE',
    en: 'FACE Program',
    de: 'FACE-Programm',
  },
  regional_assoc_certified: {
    icon: 'shield-check',
    es: 'Asociación regional',
    en: 'Regional association',
    de: 'Regionaler Verband',
  },
  operator_declaration: {
    icon: 'storefront',
    es: 'Declaración del operador',
    en: 'Operator declaration',
    de: 'Erklärung des Betreibers',
  },
  multiple_sources: {
    icon: 'check-all',
    es: 'Múltiples fuentes',
    en: 'Multiple sources',
    de: 'Mehrere Quellen',
  },
};

const ENDORSED_BY: Record<AppLanguage, string> = {
  es: 'Avalado por:',
  en: 'Endorsed by:',
  de: 'Empfohlen von:',
};

function isOlderThanMonths(isoDate: string, months: number): boolean {
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  const cutoff = new Date();
  cutoff.setMonth(cutoff.getMonth() - months);
  return date < cutoff;
}

/**
 * Erklaert transparent, wie ein Restaurant verifiziert wurde.
 */
function VerificationSection({ restaurant }: VerificationSectionProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const language = useAppLanguage();
  const fmt = useFormatDate();
  const methods = restaurant.verification_methods ?? [];
  const showFace = restaurant.face_program === true;
  const showAoecs = restaurant.aoecs_certified === true;
  const hasCertificate = showFace || showAoecs;
  const hasDate = Boolean(restaurant.last_verified_at);
  const hasAuthority = Boolean(restaurant.national_authority?.trim());

  if (methods.length === 0 && !hasCertificate && !hasDate && !hasAuthority) {
    return null;
  }

  const certificateParts: string[] = [];
  if (showFace) certificateParts.push('FACE');
  if (showAoecs) certificateParts.push('AOECS');

  const isStale =
    restaurant.last_verified_at != null && isOlderThanMonths(restaurant.last_verified_at, 12);

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <View style={styles.titleRow}>
          <MaterialCommunityIcons name="shield-check" size={18} color={colors.primary} />
          <Text style={styles.title}>{t('detail.verification')}</Text>
        </View>

        {methods.map((method) => {
          const entry = VERIFICATION_LABELS[method];
          if (!entry) {
            return null;
          }
          return (
            <View key={method} style={styles.methodRow}>
              <MaterialCommunityIcons name={entry.icon} size={18} color={colors.primary} />
              <Text style={styles.methodLabel}>{entry[language]}</Text>
            </View>
          );
        })}

        {hasCertificate ? (
          <View style={styles.methodRow}>
            <MaterialCommunityIcons name="medal" size={18} color={colors.primary} />
            <Text style={styles.methodLabel}>
              {t('detail.certified_by', { authority: certificateParts.join(' / ') })}
            </Text>
          </View>
        ) : null}

        {restaurant.last_verified_at ? (
          <View style={styles.dateBlock}>
            <Text style={styles.dateText}>
              {t('detail.verified_on', {
                date: fmt(restaurant.last_verified_at),
              })}
            </Text>
            {isStale ? (
              <Text style={styles.warningText}>{t('detail.verification_outdated')}</Text>
            ) : null}
          </View>
        ) : null}

        {restaurant.national_authority ? (
          <Text style={styles.authorityText}>
            {ENDORSED_BY[language]} {restaurant.national_authority}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.cardPadding,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.cardPadding,
  },
  title: {
    ...typography.h4,
    fontWeight: '700',
    color: colors.primary,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  methodLabel: {
    ...typography.bodySmall,
    flex: 1,
    color: colors.textPrimary,
  },
  dateBlock: {
    marginTop: spacing.sm,
  },
  dateText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  warningText: {
    ...typography.bodySmall,
    marginTop: spacing.sm,
    fontWeight: '600',
    color: colors.warning,
  },
  authorityText: {
    ...typography.caption,
    marginTop: spacing.cardPadding,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default VerificationSection;
