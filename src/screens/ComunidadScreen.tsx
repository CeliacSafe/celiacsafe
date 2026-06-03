import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import EmptyState from '../components/EmptyState';
import { colors } from '../theme/colors';

export function ComunidadScreen() {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <EmptyState
        illustration="default"
        iconName="account-group-outline"
        title={t('tabs.community')}
        description={t('community.coming_soon')}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
