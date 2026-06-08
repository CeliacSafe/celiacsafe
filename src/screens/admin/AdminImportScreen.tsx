import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import AdminScreenLayout from '../../components/AdminScreenLayout';
import { useAdminStore } from '../../store/adminStore';
import { useThemedStyles } from '../../theme/useThemedStyles';
import { type AppColors } from '../../theme/palette';
import { radius, spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { hapticLight, hapticSuccess } from '../../utils/haptics';

export default function AdminImportScreen() {
  const { t } = useTranslation();
  const styles = useThemedStyles(createStyles);
  const importCsvText = useAdminStore((s) => s.importCsvText);
  const [lastResult, setLastResult] = useState<string | null>(null);

  const pickAndImport = async (kind: 'auto' | 'restaurants' | 'submissions') => {
    hapticLight();
    const result = await DocumentPicker.getDocumentAsync({
      type: ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel'],
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    const uri = result.assets[0].uri;
    const text = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const importResult = importCsvText(text, kind);
    hapticSuccess();

    const summary = t('admin.import_result', {
      imported: importResult.imported,
      skipped: importResult.skipped,
    });
    setLastResult(summary);

    if (importResult.errors.length) {
      Alert.alert(t('admin.import_title'), `${summary}\n\n${importResult.errors.join('\n')}`);
    } else {
      Alert.alert(t('admin.import_title'), summary);
    }
  };

  return (
    <AdminScreenLayout title={t('admin.import_title')}>
      <View style={styles.content}>
        <Text style={styles.hint}>{t('admin.import_hint')}</Text>

        <Pressable onPress={() => pickAndImport('auto')} style={styles.button}>
          <Text style={styles.buttonLabel}>{t('admin.import_auto')}</Text>
        </Pressable>
        <Pressable onPress={() => pickAndImport('restaurants')} style={styles.buttonSecondary}>
          <Text style={styles.buttonLabelSecondary}>{t('admin.import_restaurants')}</Text>
        </Pressable>
        <Pressable onPress={() => pickAndImport('submissions')} style={styles.buttonSecondary}>
          <Text style={styles.buttonLabelSecondary}>{t('admin.import_submissions')}</Text>
        </Pressable>

        {lastResult ? <Text style={styles.result}>{lastResult}</Text> : null}

        <Text style={styles.formatTitle}>{t('admin.csv_format_title')}</Text>
        <Text style={styles.formatText}>{t('admin.csv_format_restaurants')}</Text>
        <Text style={styles.formatText}>{t('admin.csv_format_submissions')}</Text>
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
  button: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.lg,
    paddingVertical: spacing.cardPadding,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.cardPadding,
    alignItems: 'center',
  },
  buttonLabel: {
    ...typography.button,
    color: colors.onPrimary,
    fontWeight: '700',
  },
  buttonLabelSecondary: {
    ...typography.button,
    color: colors.primary,
    fontWeight: '600',
  },
  result: {
    ...typography.body,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  formatTitle: {
    ...typography.overline,
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
  formatText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
