import { parseSubmissionData } from '../submissionSchema';

describe('submissionSchema', () => {
  it('accepts valid submission data', () => {
    const parsed = parseSubmissionData({
      restaurantName: 'Test Restaurant',
      city: 'Palma',
      submitterEmail: 'test@example.com',
    });
    expect(parsed?.restaurantName).toBe('Test Restaurant');
    expect(parsed?.city).toBe('Palma');
  });

  it('rejects too short restaurant name', () => {
    expect(parseSubmissionData({ restaurantName: 'A', city: 'Palma' })).toBeNull();
  });

  it('rejects invalid email', () => {
    expect(
      parseSubmissionData({
        restaurantName: 'Test',
        city: 'Palma',
        submitterEmail: 'not-an-email',
      })
    ).toBeNull();
  });

  it('normalizes www. website to https', () => {
    const parsed = parseSubmissionData({
      restaurantName: 'Test',
      city: 'Palma',
      website: 'www.example.com',
    });
    expect(parsed?.website).toBe('https://www.example.com');
  });
});
