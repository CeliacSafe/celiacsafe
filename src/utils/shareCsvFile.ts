import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

export async function shareTextAsFile(content: string, filename: string): Promise<void> {
  const directory = FileSystem.cacheDirectory ?? FileSystem.documentDirectory;
  if (!directory) {
    Alert.alert('Export', 'Kein Dateisystem verfügbar.');
    return;
  }

  const uri = `${directory}${filename}`;
  await FileSystem.writeAsStringAsync(uri, content, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    Alert.alert('Export', Platform.OS === 'web' ? 'Download nicht verfügbar.' : 'Teilen nicht verfügbar.');
    return;
  }

  await Sharing.shareAsync(uri, {
    mimeType: 'text/csv',
    UTI: 'public.comma-separated-values-text',
    dialogTitle: filename,
  });
}
