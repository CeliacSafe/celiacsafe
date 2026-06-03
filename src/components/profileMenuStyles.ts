import { StyleSheet } from 'react-native';

import { colors } from '../theme/colors';
import { SPACE_LG, SPACE_MD } from '../theme/spacing';

/** Gemeinsames Item-Layout fuer Profil-Menuezeilen und plain Action-Buttons. */
export const profileMenuStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACE_MD,
    paddingVertical: 14,
    paddingHorizontal: SPACE_LG,
  },
  rowPressed: {
    opacity: 0.85,
  },
  label: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  labelMuted: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
  chevronSpacer: {
    width: 22,
  },
});

export const PROFILE_MENU_ICON_SIZE = 24;
export const PROFILE_MENU_CHEVRON_SIZE = 22;
