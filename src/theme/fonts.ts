import {
  Fraunces_300Light,
  Fraunces_400Regular,
  Fraunces_400Regular_Italic,
  Fraunces_500Medium,
  Fraunces_500Medium_Italic,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from '@expo-google-fonts/fraunces';
import {
  InterTight_400Regular,
  InterTight_500Medium,
  InterTight_600SemiBold,
  InterTight_700Bold,
} from '@expo-google-fonts/inter-tight';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
} from '@expo-google-fonts/jetbrains-mono';

/**
 * Schrift-Assets fuer `useFonts` (Editorial-Botanical).
 *
 * - Fraunces  -> Display / Headings (serif, expressiv)
 * - Inter Tight -> Body / UI / Buttons
 * - JetBrains Mono -> Labels / Meta / Overlines
 */
export const fontAssets = {
  Fraunces_300Light,
  Fraunces_400Regular,
  Fraunces_400Regular_Italic,
  Fraunces_500Medium,
  Fraunces_500Medium_Italic,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
  InterTight_400Regular,
  InterTight_500Medium,
  InterTight_600SemiBold,
  InterTight_700Bold,
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
};

/** Geladene Font-Family-Namen (entsprechen den Asset-Keys). */
export const fontFamilies = {
  serifLight: 'Fraunces_300Light',
  serifRegular: 'Fraunces_400Regular',
  serif: 'Fraunces_500Medium',
  serifSemiBold: 'Fraunces_600SemiBold',
  serifBold: 'Fraunces_700Bold',
  serifItalic: 'Fraunces_400Regular_Italic',
  serifItalicMedium: 'Fraunces_500Medium_Italic',

  sans: 'InterTight_400Regular',
  sansMedium: 'InterTight_500Medium',
  sansSemiBold: 'InterTight_600SemiBold',
  sansBold: 'InterTight_700Bold',

  mono: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
} as const;

export type FontFamily = (typeof fontFamilies)[keyof typeof fontFamilies];
