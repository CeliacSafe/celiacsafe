import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import AdminScreenLayout from '../../components/AdminScreenLayout';
import type { PerfilStackParamList } from '../../navigation/PerfilStack';
import { useAdminStore } from '../../store/adminStore';
import { useTheme } from '../../theme/ThemeContext';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { type AppColors } from '../../theme/palette';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { hapticError, hapticSuccess } from '../../utils/haptics';

type Nav = NativeStackNavigationProp<PerfilStackParamList, 'AdminLogin'>;

export default function AdminLoginScreen() {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const navigation = useNavigation<Nav>();
  const authenticate = useAdminStore((s) => s.authenticate);
  const [pin, setPin] = useState('');

  const handleLogin = () => {
    if (authenticate(pin)) {
      hapticSuccess();
      navigation.replace('AdminDashboard');
      return;
    }
    hapticError();
    Alert.alert(t('admin.login_error_title'), t('admin.login_error_message'));
    setPin('');
  };

  return (
    <AdminScreenLayout title={t('admin.login_title')}>
      <View style={styles.content}>
        <Text style={styles.hint}>{t('admin.login_hint')}</Text>
        <TextInput
          value={pin}
          onChangeText={setPin}
          keyboardType="number-pad"
          secureTextEntry
          maxLength={8}
          placeholder={t('admin.pin_placeholder')}
          placeholderTextColor={colors.textSecondary}
          style={styles.input}
        />
        <Pressable onPress={handleLogin} style={styles.button}>
          <Text style={styles.buttonLabel}>{t('admin.login_button')}</Text>
        </Pressable>
      </View>
    </AdminScreenLayout>
  );
}

const createStyles = (colors: AppColors) => StyleSheet.create({
  content: {
    padding: spacing.screenPadding,
    gap: spacing.md,
  },
  hint: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  input: {
    ...typography.body,
    borderWidth: 1,
    borderColor: colors.cuisineSurface,
    borderRadius: radius.lg,
    padding: spacing.cardPadding,
    color: colors.textPrimary,
    backgroundColor: colors.surface,
  },
  button: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.lg,
    paddingVertical: spacing.cardPadding,
    alignItems: 'center',
  },
  buttonLabel: {
    ...typography.button,
    color: colors.onPrimary,
    fontWeight: '700',
  },
});
