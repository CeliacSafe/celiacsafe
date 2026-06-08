import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useAppLanguage } from '../i18n/useAppLanguage';
import type { AppLanguage } from '../i18n/getLocalizedName';
import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { spacing } from '../theme/spacing';

import { typography } from '../theme/typography';
import type { Restaurant } from '../types/Restaurant';

interface OpeningHoursProps {
  restaurant: Restaurant;
}

const WEEKDAY_NAMES: Record<AppLanguage, string[]> = {
  es: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  de: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
};

const CLOSED_KEYWORDS = ['cerrado', 'closed', 'geschlossen'];

function getTodayName(language: AppLanguage): string {
  const dayIndex = new Date().getDay();
  return WEEKDAY_NAMES[language][dayIndex] ?? '';
}

function isTodayLine(line: string, todayName: string): boolean {
  return line.toLowerCase().includes(todayName.toLowerCase());
}

function isClosedLine(line: string): boolean {
  const lower = line.toLowerCase();
  return CLOSED_KEYWORDS.some((keyword) => lower.includes(keyword));
}

/**
 * Oeffnungszeiten als Textblock (v3-Format).
 * TODO: strukturierte opening_hours in Phase 2 (pro Wochentag als Object).
 */
function OpeningHours({ restaurant }: OpeningHoursProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const language = useAppLanguage();
  const hoursText = restaurant.opening_hours?.trim();
  const todayName = getTodayName(language);

  if (!hoursText) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.titleRow}>
        <MaterialCommunityIcons name="clock-outline" size={18} color={colors.primary} />
        <Text style={styles.title}>{t('detail.opening_hours')}</Text>
      </View>

      <View style={styles.lines}>
        {hoursText.split('\n').map((line, index) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return null;
          }
          const isToday = isTodayLine(trimmed, todayName);
          const isClosedToday = isToday && isClosedLine(trimmed);

          return (
            <Text
              key={`${index}-${trimmed}`}
              style={[
                styles.line,
                isToday && styles.lineToday,
                isClosedToday && styles.lineClosedToday,
              ]}
            >
              {trimmed}
            </Text>
          );
        })}
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.screenPadding,
    paddingVertical: spacing.cardPadding,
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
  lines: {
    gap: spacing.sm,
  },
  line: {
    ...typography.body,
    color: colors.textPrimary,
  },
  lineToday: {
    fontWeight: '700',
    color: colors.primary,
  },
  lineClosedToday: {
    color: colors.heart,
  },
  unavailable: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
});

export default OpeningHours;

// i18n-migrated
