import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { WHATSAPP_DEFAULT_MESSAGES } from '../i18n/contact';
import { useAppLanguage } from '../i18n/useAppLanguage';
import { colors } from '../theme/colors';
import { RADIUS_BUTTON } from '../theme/radii';
import { SPACE_LG, SPACE_MD, SPACE_XL } from '../theme/spacing';
import type { Restaurant } from '../types/Restaurant';
import { openMapsRouting, openPhone, openUrl, openWhatsApp } from '../utils/openExternalUrl';

interface QuickActionsBarProps {
  restaurant: Restaurant;
}

type ActionIconName = keyof typeof MaterialCommunityIcons.glyphMap;

interface QuickAction {
  key: string;
  icon: ActionIconName;
  label: string;
  onPress: () => void;
}

function normalizeWebsiteUrl(url: string): string {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function QuickActionsBar({ restaurant }: QuickActionsBarProps) {
  const { t } = useTranslation();
  const language = useAppLanguage();
  const actions: QuickAction[] = [];

  if (restaurant.phone) {
    actions.push({
      key: 'call',
      icon: 'phone',
      label: t('detail.call'),
      onPress: () => openPhone(restaurant.phone!),
    });
  }

  if (restaurant.whatsapp) {
    actions.push({
      key: 'whatsapp',
      icon: 'whatsapp',
      label: t('detail.whatsapp'),
      onPress: () => openWhatsApp(restaurant.whatsapp!, WHATSAPP_DEFAULT_MESSAGES[language]),
    });
  }

  if (restaurant.website) {
    actions.push({
      key: 'website',
      icon: 'web',
      label: t('detail.website'),
      onPress: () => {
        openUrl(normalizeWebsiteUrl(restaurant.website!)).catch(() => undefined);
      },
    });
  }

  if (restaurant.latitude != null && restaurant.longitude != null) {
    actions.push({
      key: 'route',
      icon: 'map-marker-radius',
      label: t('detail.route'),
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

// i18n-migrated
