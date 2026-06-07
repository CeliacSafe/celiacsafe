import { isSafeExternalUrl } from '../safeUrl';

describe('safeUrl', () => {
  it('allows https URLs', () => {
    expect(isSafeExternalUrl('https://example.com')).toBe(true);
  });

  it('allows tel and mailto', () => {
    expect(isSafeExternalUrl('tel:+34123456789')).toBe(true);
    expect(isSafeExternalUrl('mailto:test@example.com')).toBe(true);
  });

  it('blocks javascript URLs', () => {
    expect(isSafeExternalUrl('javascript:alert(1)')).toBe(false);
  });

  it('blocks data URLs', () => {
    expect(isSafeExternalUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
  });
});
