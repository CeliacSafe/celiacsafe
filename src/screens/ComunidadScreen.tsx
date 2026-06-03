import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors } from '../theme/colors';

export function ComunidadScreen() {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Celiac Safe</Text>
      <Text style={styles.title}>{t('tabs.community')}</Text>
      <Text style={styles.subtitle}>{t('community.coming_soon')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  logo: {
    marginBottom: 16,
    color: colors.primary,
    fontSize: 22,
    fontWeight: '700',
  },
  title: {
    color: colors.textPrimary,
    fontSize: 36,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 12,
    color: colors.textSecondary,
    fontSize: 18,
    fontWeight: '600',
  },
});

// i18n-migrated
