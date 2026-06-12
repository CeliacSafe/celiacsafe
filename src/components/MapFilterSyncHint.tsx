import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../theme/ThemeContext';
import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';
import { hapticLight } from '../utils/haptics';

type RootTabNavigationProp = BottomTabNavigationProp<{
  Buscar: undefined;
  Comunidad: undefined;
  Mapa: undefined;
  Favoritos: undefined;
  Perfil: undefined;
}>;

function MapFilterSyncHint() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = useThemedStyles(createStyles);
  const navigation = useNavigation<RootTabNavigationProp>();
  const [dismissed, setDismissed] = useState(false);

  const openSearch = useCallback(() => {
    hapticLight();
    navigation.navigate('Buscar');
  }, [navigation]);

  const dismiss = useCallback(() => {
    hapticLight();
    setDismissed(true);
  }, []);

  if (dismissed) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <MaterialCommunityIcons name="information-outline" size={18} color={colors.primary} />
      <Text style={styles.text}>{t('map.filter_sync_hint')}</Text>
      <Pressable
        onPress={openSearch}
        accessibilityRole="button"
        accessibilityLabel={t('map.filter_sync_action')}
        style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
      >
        <Text style={styles.actionLabel}>{t('map.filter_sync_action')}</Text>
      </Pressable>
      <Pressable
        onPress={dismiss}
        accessibilityRole="button"
        accessibilityLabel={t('common.close')}
        hitSlop={8}
        style={({ pressed }) => [styles.close, pressed && styles.closePressed]}
      >
        <MaterialCommunityIcons name="close" size={18} color={colors.textSecondary} />
      </Pressable>
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginHorizontal: spacing.screenPadding,
      marginTop: spacing.xs,
      paddingHorizontal: spacing.cardPadding,
      paddingVertical: spacing.sm,
      borderRadius: radius.lg,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.lineSoft,
    },
    text: {
      ...typography.bodySmall,
      flex: 1,
      color: colors.textSecondary,
    },
    action: {
      paddingHorizontal: spacing.xs,
    },
    actionPressed: {
      opacity: 0.85,
    },
    actionLabel: {
      ...typography.bodySmall,
      color: colors.primary,
      fontWeight: '700',
    },
    close: {
      padding: spacing.xs,
    },
    closePressed: {
      opacity: 0.85,
    },
  });

export default MapFilterSyncHint;
