import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { WHATSAPP_DEFAULT_MESSAGES } from '../i18n/contact';
import type { AppLanguage } from '../i18n/getLocalizedName';
import { colors } from '../theme/colors';
import { SPACE_MD, SPACE_SM, SPACE_XL } from '../theme/spacing';
import type { Restaurant } from '../types/Restaurant';
import {
  openEmail,
  openFacebook,
  openInstagram,
  openPhone,
  openUrl,
  openWhatsApp,
} from '../utils/openExternalUrl';

interface ContactDetailsSectionProps {
  restaurant: Restaurant;
  language?: AppLanguage;
}

type IconName = keyof typeof MaterialCommunityIcons.glyphMap;

const SECTION_TITLES: Record<AppLanguage, string> = {
  es: 'Contacto',
  en: 'Contact',
  de: 'Kontakt',
};

const FACEBOOK_LABEL: Record<AppLanguage, string> = {
  es: 'Página de FB',
  en: 'Facebook page',
  de: 'Facebook-Seite',
};

interface ContactRow {
  key: string;
  icon: IconName;
  label: string;
  value: string;
  onPress: () => void;
}

function normalizeWebsiteUrl(url: string): string {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function extractDomain(url: string): string {
  try {
    const hostname = new URL(normalizeWebsiteUrl(url)).hostname;
    return hostname.replace(/^www\./i, '');
  } catch {
    return url;
  }
}

function formatInstagramLabel(handle: string): string {
  const cleaned = handle.trim();
  return cleaned.startsWith('@') ? cleaned : `@${cleaned}`;
}

/**
 * Sekundaere Kontaktliste mit Telefon, Social und E-Mail.
 */
function ContactDetailsSection({ restaurant, language = 'es' }: ContactDetailsSectionProps) {
  const rows: ContactRow[] = [];

  if (restaurant.phone) {
    rows.push({
      key: 'phone',
      icon: 'phone',
      label: restaurant.phone,
      value: restaurant.phone,
      onPress: () => openPhone(restaurant.phone!),
    });
  }

  if (restaurant.whatsapp) {
    rows.push({
      key: 'whatsapp',
      icon: 'whatsapp',
      label: restaurant.whatsapp,
      value: restaurant.whatsapp,
      onPress: () => openWhatsApp(restaurant.whatsapp!, WHATSAPP_DEFAULT_MESSAGES[language]),
    });
  }

  if (restaurant.email) {
    rows.push({
      key: 'email',
      icon: 'email',
      label: restaurant.email,
      value: restaurant.email,
      onPress: () => openEmail(restaurant.email!),
    });
  }

  if (restaurant.website) {
    const website = restaurant.website.trim();
    rows.push({
      key: 'website',
      icon: 'web',
      label: extractDomain(website),
      value: website,
      onPress: () => openUrl(normalizeWebsiteUrl(website)).catch(() => undefined),
    });
  }

  if (restaurant.instagram) {
    const handle = formatInstagramLabel(restaurant.instagram);
    rows.push({
      key: 'instagram',
      icon: 'instagram',
      label: handle,
      value: handle,
      onPress: () => openInstagram(restaurant.instagram!),
    });
  }

  if (restaurant.facebook) {
    rows.push({
      key: 'facebook',
      icon: 'facebook',
      label: FACEBOOK_LABEL[language],
      value: restaurant.facebook,
      onPress: () => openFacebook(restaurant.facebook!),
    });
  }

  if (rows.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.titleRow}>
        <MaterialCommunityIcons
          name="card-account-details-outline"
          size={18}
          color={colors.primary}
        />
        <Text style={styles.title}>{SECTION_TITLES[language]}</Text>
      </View>

      {rows.map((row, index) => (
        <Pressable
          key={row.key}
          onPress={row.onPress}
          android_ripple={{ color: colors.rippleLight }}
          style={({ pressed }) => [
            styles.row,
            index < rows.length - 1 && styles.rowBorder,
            pressed && styles.pressed,
          ]}
        >
          <MaterialCommunityIcons name={row.icon} size={22} color={colors.primary} />
          <View style={styles.rowText}>
            <Text style={styles.rowLabel}>{row.label}</Text>
            {row.value !== row.label ? (
              <Text style={styles.rowValue} numberOfLines={1}>
                {row.value}
              </Text>
            ) : null}
          </View>
          <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSecondary} />
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: SPACE_XL,
    paddingVertical: SPACE_MD,
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE_MD,
    paddingVertical: 14,
    overflow: 'hidden',
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.surface,
  },
  rowText: {
    flex: 1,
  },
  rowLabel: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  rowValue: {
    marginTop: 2,
    color: colors.textSecondary,
    fontSize: 12,
  },
  pressed: {
    opacity: 0.9,
  },
});

export default ContactDetailsSection;
