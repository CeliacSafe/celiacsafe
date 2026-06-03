import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

import { typography } from '../theme/typography';

/** Gemeinsames Item-Layout fuer Profil-Menuezeilen und plain Action-Buttons. */
export const profileMenuStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.cardPadding,
    paddingVertical: spacing.sm + spacing.xs,
    paddingHorizontal: spacing.md,
  },
  rowPressed: {
    opacity: 0.85,
  },
  label: {
    ...typography.body,
    flex: 1,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  labelMuted: {
    ...typography.body,
    flex: 1,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  chevronSpacer: {
    width: 22,
  },
});

export const PROFILE_MENU_ICON_SIZE = 24;
export const PROFILE_MENU_CHEVRON_SIZE = 22;
