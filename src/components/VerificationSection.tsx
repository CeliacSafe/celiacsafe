import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppLanguage } from '../i18n/useAppLanguage';
import type { AppLanguage } from '../i18n/getLocalizedName';
import { colors } from '../theme/colors';
import { RADIUS_INPUT } from '../theme/radii';
import { SPACE_LG, SPACE_MD, SPACE_SM, SPACE_XL } from '../theme/spacing';
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

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: SPACE_XL,
    paddingVertical: SPACE_MD,
  },
  container: {
    backgroundColor: colors.surface,
    borderRadius: RADIUS_INPUT,
    padding: SPACE_LG,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE_SM,
    marginBottom: SPACE_MD,
  },
  title: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE_SM,
    marginBottom: SPACE_SM,
  },
  methodLabel: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 20,
  },
  dateBlock: {
    marginTop: SPACE_SM,
  },
  dateText: {
    color: colors.textSecondary,
    fontSize: 13,
  },
  warningText: {
    marginTop: SPACE_SM,
    color: colors.warning,
    fontSize: 13,
    fontWeight: '600',
  },
  authorityText: {
    marginTop: SPACE_MD,
    color: colors.textSecondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
});

export default VerificationSection;
