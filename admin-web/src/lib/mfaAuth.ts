import { supabase } from './supabase';
import { isDevAuthBypassEnabled } from './devAuthBypass';

export async function needsMfaVerification(): Promise<boolean> {
  if (isDevAuthBypassEnabled()) {
    return false;
  }
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error || !data) {
    return false;
  }
  return data.nextLevel === 'aal2' && data.currentLevel !== 'aal2';
}

export async function isMfaSatisfied(): Promise<boolean> {
  return !(await needsMfaVerification());
}

export async function getVerifiedTotpFactorId(): Promise<string | null> {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error || !data) {
    return null;
  }
  const factor = data.totp.find((entry) => entry.status === 'verified');
  return factor?.id ?? null;
}

export async function beginTotpLoginChallenge(): Promise<
  { factorId: string; challengeId: string } | { error: string }
> {
  const factorId = await getVerifiedTotpFactorId();
  if (!factorId) {
    return { error: 'Kein verifizierter Authenticator für dieses Konto.' };
  }

  const { data, error } = await supabase.auth.mfa.challenge({ factorId });
  if (error || !data) {
    return { error: error?.message ?? 'MFA-Challenge fehlgeschlagen.' };
  }

  return { factorId, challengeId: data.id };
}

export async function verifyTotpLoginCode(
  factorId: string,
  challengeId: string,
  code: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId,
    code: code.trim(),
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

export async function enrollTotp(friendlyName = 'CeliacSafe Admin') {
  return supabase.auth.mfa.enroll({
    factorType: 'totp',
    friendlyName,
  });
}

export async function confirmTotpEnrollment(
  factorId: string,
  code: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await supabase.auth.mfa.challengeAndVerify({
    factorId,
    code: code.trim(),
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true };
}

export async function listVerifiedTotpFactors() {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error || !data) {
    return [];
  }
  return data.totp.filter((factor) => factor.status === 'verified');
}

export async function hasVerifiedMfa(): Promise<boolean> {
  if (isDevAuthBypassEnabled()) {
    return true;
  }
  const factors = await listVerifiedTotpFactors();
  return factors.length > 0;
}

export async function unenrollTotpFactor(
  factorId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true };
}
