import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { WHATSAPP_DEFAULT_MESSAGES } from '../i18n/contact';
import type { AppLanguage } from '../i18n/getLocalizedName';
import { colors } from '../theme/colors';
import { RADIUS_BUTTON } from '../theme/radii';
import { SPACE_LG, SPACE_MD, SPACE_XL } from '../theme/spacing';
import type { Restaurant } from '../types/Restaurant';
import { openMapsRouting, openPhone, openUrl, openWhatsApp } from '../utils/openExternalUrl';

interface QuickActionsBarProps {
  restaurant: Restaurant;
  language?: AppLanguage;
}

type ActionIconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface QuickAction {
  key: string;
  icon: ActionIconName;
  label: string;
  onPress: () => void;
}

const ACTION_LABELS = {
  call: { es: 'Llamar', en: 'Call', de: 'Anrufen' },
  whatsapp: { es: 'WhatsApp', en: 'WhatsApp', de: 'WhatsApp' },
  website: { es: 'Web', en: 'Website', de: 'Webseite' },
  route: { es: 'Ruta', en: 'Route', de: 'Route' },
} as const;

function normalizeWebsiteUrl(url: string): string {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/**
 * Prominente Schnellaktionen direkt unter dem Detail-Header (horizontal scrollbar).
 */
function QuickActionsBar({ restaurant, language = 'es' }: QuickActionsBarProps) {
  const actions: QuickAction[] = [];

  if (restaurant.phone) {
    actions.push({
      key: 'call',
      icon: 'phone',
      label: ACTION_LABELS.call[language],
      onPress: () => openPhone(restaurant.phone!),
    });
  }

  if (restaurant.whatsapp) {
    actions.push({
      key: 'whatsapp',
      icon: 'whatsapp',
      label: ACTION_LABELS.whatsapp[language],
      onPress: () => openWhatsApp(restaurant.whatsapp!, WHATSAPP_DEFAULT_MESSAGES[language]),
    });
  }

  if (restaurant.website) {
    actions.push({
      key: 'website',
      icon: 'web',
      label: ACTION_LABELS.website[language],
      onPress: () => {
        openUrl(normalizeWebsiteUrl(restaurant.website!)).catch(() => undefined);
      },
    });
  }

  if (restaurant.latitude != null && restaurant.longitude != null) {
    actions.push({
      key: 'route',
      icon: 'map-marker-radius',
      label: ACTION_LABELS.route[language],
      onPress: () => openMapsRouting(restaurant.latitude!, restaurant.longitude!, restaurant.name),
    });
  }

  if (actions.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {actions.map((action) => (
          <Pressable
            key={action.key}
            onPress={action.onPress}
            android_ripple={{ color: colors.rippleLight, borderless: false }}
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
          >
            <MaterialCommunityIcons name={action.icon} size={24} color={colors.primary} />
            <Text style={styles.actionLabel}>{action.label}</Text>
          </Pressable>
        ))}
        <View style={styles.trailingSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: SPACE_MD,
  },
  scrollContent: {
    paddingHorizontal: SPACE_XL,
    gap: SPACE_MD,
    paddingBottom: SPACE_LG,
  },
  actionButton: {
    width: 72,
    height: 64,
    borderRadius: RADIUS_BUTTON,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    overflow: 'hidden',
  },
  actionPressed: {
    opacity: 0.9,
  },
  actionLabel: {
    color: colors.textPrimary,
    fontSize: 12,
    fontWeight: '600',
  },
  trailingSpacer: {
    width: SPACE_MD,
  },
});

export default QuickActionsBar;
