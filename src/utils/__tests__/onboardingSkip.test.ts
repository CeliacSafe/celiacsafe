import { isRestaurantDeepLinkUrl } from '../onboardingSkip';

describe('onboardingSkip', () => {
  it('erkennt Restaurant-Deep-Links', () => {
    expect(isRestaurantDeepLinkUrl('https://celiacsafe.vercel.app/restaurant/es_md_001')).toBe(
      true
    );
    expect(isRestaurantDeepLinkUrl('https://celiacsafe.vercel.app/map/restaurant/es_md_001')).toBe(
      true
    );
    expect(isRestaurantDeepLinkUrl('celiacsafe://restaurant/es_md_001')).toBe(true);
  });

  it('ignoriert allgemeine Pfade', () => {
    expect(isRestaurantDeepLinkUrl('https://celiacsafe.vercel.app/search')).toBe(false);
    expect(isRestaurantDeepLinkUrl('https://celiacsafe.vercel.app/map')).toBe(false);
  });
});
