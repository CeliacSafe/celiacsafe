import type { AppLanguage } from '../../i18n/getLocalizedName';
import type { Restaurant } from '../../types/Restaurant';
import {
  formatCommunityFeedActivity,
  getCommunityAvatarColor,
  getCommunityVerifierInitials,
  getCommunityVerifierName,
  getRecentlyVerifiedRestaurants,
} from '../communityFeed';

describe('getRecentlyVerifiedRestaurants', () => {
  it('sortiert nach last_verified_at absteigend', () => {
    const list = getRecentlyVerifiedRestaurants([
      { id: 'a', last_verified_at: '2026-06-01' },
      { id: 'b', last_verified_at: '2026-06-10' },
      { id: 'c' },
    ] as Restaurant[]);
    expect(list.map((r) => r.id)).toEqual(['b', 'a']);
  });
});

describe('formatCommunityFeedActivity', () => {
  const t = (key: string, options?: Record<string, unknown>) => {
    if (key === 'community.feed_time_days') {
      return `${options?.count} days ago`;
    }
    if (key === 'community.feed_activity') {
      return `Rated safe by ${options?.name} ${options?.timeAgo}`;
    }
    return key;
  };

  it('formatiert Feed-Aktivitaet mit Name und Zeit', () => {
    const now = new Date('2026-06-10T12:00:00Z');
    const text = formatCommunityFeedActivity(
      { id: 'es_md_001', last_verified_at: '2026-06-08' } as Restaurant,
      'en' as AppLanguage,
      t,
      now
    );
    expect(text).toContain('Rated safe by');
    expect(text).toContain('2 days ago');
  });
});

describe('community avatar helpers', () => {
  it('nutzt Initialen fuer Avatar', () => {
    expect(getCommunityVerifierInitials('Maria')).toBe('MA');
    expect(getCommunityVerifierInitials('Anna Schmidt')).toBe('AS');
  });

  it('liefert stabile Verifier-Namen pro Restaurant-ID', () => {
    const restaurant = { id: 'es_ib_001' } as Restaurant;
    expect(getCommunityVerifierName(restaurant, 'de')).toBe(
      getCommunityVerifierName(restaurant, 'de')
    );
  });

  it('liefert Avatar-Farbe aus ID-Hash', () => {
    expect(getCommunityAvatarColor('es_ib_001')).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
