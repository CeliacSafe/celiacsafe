import { StyleSheet, Text, View } from 'react-native';

import { useThemedStyles } from '../theme/useThemedStyles';
import { type AppColors } from '../theme/palette';
import { spacing, radius } from '../theme/spacing';
import { typography } from '../theme/typography';

interface AboutTeamMemberProps {
  initials: string;
  name: string;
  role: string;
  bio: string;
  color: string;
}

function AboutTeamMember({ initials, name, role, bio, color }: AboutTeamMemberProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.row}>
      <View style={[styles.avatar, { backgroundColor: color }]}>
        <Text style={styles.avatarText}>{initials}</Text>
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.role}>{role}</Text>
        <Text style={styles.bio}>{bio}</Text>
      </View>
    </View>
  );
}

const createStyles = (colors: AppColors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: spacing.md,
      alignItems: 'flex-start',
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: radius.pill,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      ...typography.bodySmall,
      fontWeight: '700',
      color: colors.onPrimary,
    },
    textBlock: {
      flex: 1,
      gap: 2,
    },
    name: {
      ...typography.h4,
      color: colors.textPrimary,
    },
    role: {
      ...typography.caption,
      color: colors.primary,
      fontWeight: '600',
    },
    bio: {
      ...typography.bodySmall,
      color: colors.textSecondary,
      marginTop: spacing.xs,
      lineHeight: 20,
    },
  });

export default AboutTeamMember;
