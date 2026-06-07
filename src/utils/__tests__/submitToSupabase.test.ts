import { mapSubmissionInsertError } from '../submissionErrors';

describe('mapSubmissionInsertError', () => {
  it('maps email rate limit', () => {
    expect(mapSubmissionInsertError('submission_rate_limit_email')).toBe('rate_limit_email');
  });

  it('maps global rate limit', () => {
    expect(mapSubmissionInsertError('ERROR: submission_rate_limit_global')).toBe('rate_limit_global');
  });

  it('maps duplicate rate limit', () => {
    expect(mapSubmissionInsertError('submission_rate_limit_duplicate')).toBe('rate_limit_duplicate');
  });

  it('maps unknown errors', () => {
    expect(mapSubmissionInsertError('permission denied')).toBe('unknown');
  });
});
