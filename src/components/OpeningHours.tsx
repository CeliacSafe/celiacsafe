import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import type { AppLanguage } from '../i18n/getLocalizedName';
import { colors } from '../theme/colors';
import { SPACE_MD, SPACE_SM, SPACE_XL } from '../theme/spacing';
import type { Restaurant } from '../types/Restaurant';

interface OpeningHoursProps {
  restaurant: Restaurant;
  language?: AppLanguage;
}

const SECTION_TITLES: Record<AppLanguage, string> = {
  es: 'Horario',
  en: 'Opening Hours',
  de: 'Öffnungszeiten',
};

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
function OpeningHours({ restaurant, language = 'es' }: OpeningHoursProps) {
  const hoursText = restaurant.opening_hours?.trim();
  const todayName = getTodayName(language);

  if (!hoursText) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <View style={styles.titleRow}>
        <MaterialCommunityIcons name="clock-outline" size={18} color={colors.primary} />
        <Text style={styles.title}>{SECTION_TITLES[language]}</Text>
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
  lines: {
    gap: SPACE_SM,
  },
  line: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
  lineToday: {
    fontWeight: '700',
    color: colors.primary,
  },
  lineClosedToday: {
    color: colors.heart,
  },
  unavailable: {
    color: colors.textSecondary,
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default OpeningHours;
