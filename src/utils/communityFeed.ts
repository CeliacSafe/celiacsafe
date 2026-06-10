import type { TFunction } from 'i18next';

import type { AppLanguage } from '../i18n/getLocalizedName';
import type { Restaurant } from '../types/Restaurant';

const VERIFIER_NAMES: Record<AppLanguage, string[]> = {
  es: ['María', 'Carlos', 'Ana', 'Laura', 'Pablo', 'Elena'],
  de: ['Maria', 'Thomas', 'Anna', 'Laura', 'Stefan', 'Julia'],
  en: ['Maria', 'James', 'Anna', 'Laura', 'Alex', 'Emma'],
};

const AVATAR_COLORS = ['#5a6850', '#b85c3c', '#3d6b7a', '#8b4a3a', '#4a5568', '#6b7c3a'];

function hashIndex(value: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return length > 0 ? hash % length : 0;
}

export function getCommunityVerifierName(
  restaurant: Restaurant,
  language: AppLanguage
): string {
  const explicit = restaurant.verified_by?.trim();
  if (explicit) {
    return explicit;
  }
  const pool = VERIFIER_NAMES[language];
  return pool[hashIndex(restaurant.id, pool.length)] ?? pool[0];
}

export function getCommunityVerifierInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0] ?? ''}${parts[1][0] ?? ''}`.toUpperCase();
}

export function getCommunityAvatarColor(restaurantId: string): string {
  return AVATAR_COLORS[hashIndex(restaurantId, AVATAR_COLORS.length)] ?? AVATAR_COLORS[0];
}

/** Relative Zeitangabe für Community-Feed (z. B. „vor 2 Tagen“). */
export function formatCommunityTimeAgo(
  isoDate: string | undefined,
  t: TFunction,
  now: Date = new Date()
): string | null {
  if (!isoDate?.trim()) {
    return null;
  }
  const verifiedAt = new Date(isoDate);
  if (Number.isNaN(verifiedAt.getTime())) {
    return null;
  }

  const diffMs = now.getTime() - verifiedAt.getTime();
  if (diffMs < 0) {
    return t('community.feed_time_today');
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 60) {
    return t('community.feed_time_minutes', { count: Math.max(diffMinutes, 1) });
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 24) {
    return t('community.feed_time_hours', { count: diffHours });
  }

  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 1) {
    return t('community.feed_time_yesterday');
  }
  if (diffDays < 7) {
    return t('community.feed_time_days', { count: diffDays });
  }

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) {
    return t('community.feed_time_weeks', { count: diffWeeks });
  }

  const diffMonths = Math.floor(diffDays / 30);
  return t('community.feed_time_months', { count: Math.max(diffMonths, 1) });
}

export function formatCommunityFeedActivity(
  restaurant: Restaurant,
  language: AppLanguage,
  t: TFunction,
  now?: Date
): string | null {
  const timeAgo = formatCommunityTimeAgo(restaurant.last_verified_at, t, now);
  if (!timeAgo) {
    return null;
  }
  const name = getCommunityVerifierName(restaurant, language);
  return t('community.feed_activity', { name, timeAgo });
}

export function getRecentlyVerifiedRestaurants(
  restaurants: Restaurant[],
  limit = 6
): Restaurant[] {
  return [...restaurants]
    .filter((restaurant) => Boolean(restaurant.last_verified_at?.trim()))
    .sort((a, b) => (b.last_verified_at ?? '').localeCompare(a.last_verified_at ?? ''))
    .slice(0, limit);
}
