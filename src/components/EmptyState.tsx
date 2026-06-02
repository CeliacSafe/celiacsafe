import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { RADIUS_BUTTON } from '../theme/radii';
import { SPACE_LG, SPACE_MD, SPACE_SM, SPACE_XXL } from '../theme/spacing';

interface EmptyStateProps {
  iconName: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

function EmptyState({ iconName, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <MaterialCommunityIcons name={iconName} size={64} color={colors.textSecondary} />
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} style={styles.actionButton}>
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACE_XXL,
  },
  title: {
    marginTop: SPACE_LG,
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    marginTop: SPACE_SM,
    maxWidth: 280,
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionButton: {
    marginTop: SPACE_LG,
    borderRadius: RADIUS_BUTTON,
    backgroundColor: colors.primary,
    paddingHorizontal: SPACE_LG,
    paddingVertical: SPACE_MD - 2,
  },
  actionLabel: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default EmptyState;
