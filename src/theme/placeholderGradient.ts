import { colors } from './colors';

/** Gruen-Toene → App-Hintergrund; Index per Restaurant-ID (stabil, leicht variiert). */
const PLACEHOLDER_GRADIENTS: readonly [string, string][] = [
  ['#2E7D32', colors.background],
  ['#1B5E20', colors.background],
  ['#388E3C', colors.background],
  ['#43A047', colors.background],
  ['#33691E', colors.background],
];

function hashRestaurantId(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = Math.imul(31, hash) + id.charCodeAt(i);
  }
  return Math.abs(hash);
}

/** Deterministischer Platzhalter-Gradient fuer ein Restaurant. */
export function getPlaceholderGradientColors(restaurantId: string): [string, string] {
  const index = hashRestaurantId(restaurantId) % PLACEHOLDER_GRADIENTS.length;
  return PLACEHOLDER_GRADIENTS[index];
}

/** Icon auf Platzhalter-Bildern (primary mit 30 % Deckkraft). */
export const PLACEHOLDER_ICON_COLOR = 'rgba(165, 214, 167, 0.3)';
