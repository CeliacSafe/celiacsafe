export const colors = {
  primary: '#A5D6A7',
  primaryDark: '#2E7D32',
  background: '#121212',
  surface: '#1E1E1E',
  textPrimary: '#FFFFFF',
  textSecondary: '#B3B3B3',
  heart: '#E57373',
} as const;

export type AppColor = keyof typeof colors;
