export type SubmissionErrorReason =
  | 'validation'
  | 'rate_limit_email'
  | 'rate_limit_global'
  | 'rate_limit_duplicate'
  | 'unknown';

export function mapSubmissionInsertError(message: string): SubmissionErrorReason {
  const normalized = message.toLowerCase();
  if (normalized.includes('submission_rate_limit_email')) {
    return 'rate_limit_email';
  }
  if (normalized.includes('submission_rate_limit_global')) {
    return 'rate_limit_global';
  }
  if (normalized.includes('submission_rate_limit_duplicate')) {
    return 'rate_limit_duplicate';
  }
  return 'unknown';
}
