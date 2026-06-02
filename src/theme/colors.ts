export const colors = {
  primary: '#A5D6A7',
  primaryDark: '#2E7D32',
  background: '#121212',
  surface: '#1E1E1E',
  textPrimary: '#FFFFFF',
  textSecondary: '#B3B3B3',
  heart: '#E57373',
  white: '#FFFFFF',
  verifiedGreen: '#1B5E20',
  cuisineSurface: '#2A2A2A',
  overlayDark: '#00000080',
  shadow: '#000000',
  sinGlutenBg: 'rgba(46, 125, 50, 0.45)',
  rippleLight: 'rgba(255, 255, 255, 0.12)',
  overlayWhite15: 'rgba(255, 255, 255, 0.15)',
  overlayWhite20: 'rgba(255, 255, 255, 0.2)',
  skeletonMuted: 'rgba(255, 255, 255, 0.08)',
  skeletonStrong: 'rgba(255, 255, 255, 0.1)',
  warning: '#FFD54F',
  error: '#EF5350',
} as const;

export type AppColor = keyof typeof colors;
