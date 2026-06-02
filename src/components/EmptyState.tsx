import { MaterialCommunityIcons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';

interface EmptyStateProps {
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description?: string;
}

function EmptyState({ iconName, title, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={iconName} size={64} color={colors.textSecondary} />
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    marginTop: 16,
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    marginTop: 8,
    maxWidth: 280,
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default EmptyState;
