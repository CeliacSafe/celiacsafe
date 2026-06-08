import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  clearLoginAttempts,
  getLoginLockout,
  MIN_PASSWORD_LENGTH,
  recordFailedLogin,
  validatePasswordLength,
} from '../lib/loginGuard';
import {
  beginTotpLoginChallenge,
  isMfaSatisfied,
  needsMfaVerification,
  verifyTotpLoginCode,
} from '../lib/mfaAuth';
import { getDevAutoLoginCredentials, isDevAuthBypassEnabled } from '../lib/devAuthBypass';
import { ensureDevAutoLogin } from '../lib/devAutoLogin';
import { supabase } from '../lib/supabase';

type LoginStep = 'credentials' | 'totp';

export default function LoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<LoginStep>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [factorId, setFactorId] = useState<string | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const startTotpStep = useCallback(async () => {
    const challenge = await beginTotpLoginChallenge();
    if ('error' in challenge) {
      setError(challenge.error);
      await supabase.auth.signOut();
      setStep('credentials');
      return false;
    }
    setFactorId(challenge.factorId);
    setChallengeId(challenge.challengeId);
    setStep('totp');
    setTotpCode('');
    return true;
  }, []);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      if (isDevAuthBypassEnabled()) {
        await ensureDevAutoLogin();
        const { data: afterDev } = await supabase.auth.getSession();
        if (cancelled) {
          return;
        }
        if (afterDev.session) {
          navigate('/', { replace: true });
          setCheckingSession(false);
          return;
        }
        if (!getDevAutoLoginCredentials()) {
          setError(
            'Localhost-Dev: VITE_ADMIN_DEV_EMAIL und VITE_ADMIN_DEV_PASSWORD in admin-web/.env setzen.',
          );
          setCheckingSession(false);
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (cancelled) {
        return;
      }

      if (data.session && (await needsMfaVerification())) {
        await startTotpStep();
      } else if (data.session && (await isMfaSatisfied())) {
        navigate('/', { replace: true });
      }

      if (!cancelled) {
        setCheckingSession(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, startTotpStep]);

  const handleCredentialsSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (isDevAuthBypassEnabled()) {
      return;
    }
    setLoading(true);
    setError(null);

    const lockout = getLoginLockout();
    if (lockout.locked) {
      const minutes = Math.ceil((lockout.retryAfterMs ?? 0) / 60_000);
      setLoading(false);
      setError(`Zu viele Fehlversuche. Bitte in ${minutes} Min. erneut versuchen.`);
      return;
    }

    const passwordError = validatePasswordLength(password);
    if (passwordError) {
      setLoading(false);
      setError(passwordError);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      const attempt = recordFailedLogin();
      setLoading(false);
      if (attempt.locked) {
        setError('Zu viele Fehlversuche. Bitte in 15 Min. erneut versuchen.');
      } else {
        setError(`${authError.message}${attempt.attemptsLeft > 0 ? ` (${attempt.attemptsLeft} Versuche übrig)` : ''}`);
      }
      return;
    }

    clearLoginAttempts();

    if (await needsMfaVerification()) {
      const started = await startTotpStep();
      setLoading(false);
      if (!started) {
        return;
      }
      return;
    }

    setLoading(false);
    navigate('/');
  };

  const handleTotpSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!factorId || !challengeId) {
      setError('MFA-Sitzung abgelaufen. Bitte erneut anmelden.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await verifyTotpLoginCode(factorId, challengeId, totpCode);
    if (!result.ok) {
      setLoading(false);
      setError(result.message);
      const refreshed = await beginTotpLoginChallenge();
      if (!('error' in refreshed)) {
        setFactorId(refreshed.factorId);
        setChallengeId(refreshed.challengeId);
      }
      return;
    }

    setLoading(false);
    navigate('/');
  };

  const handleCancelMfa = async () => {
    await supabase.auth.signOut();
    setStep('credentials');
    setFactorId(null);
    setChallengeId(null);
    setTotpCode('');
    setError(null);
  };

  if (checkingSession) {
    return (
      <div className="layout" style={{ maxWidth: 420 }}>
        <p className="muted">Lade…</p>
      </div>
    );
  }

  if (step === 'totp') {
    return (
      <div className="layout" style={{ maxWidth: 420 }}>
        <h1 style={{ color: '#a5d6a7' }}>Zwei-Faktor-Code</h1>
        <p className="muted">
          Gib den 6-stelligen Code aus deiner Authenticator-App ein ({email || 'dein Konto'}).
        </p>
        <form onSubmit={handleTotpSubmit}>
          <label htmlFor="totp-code">Authenticator-Code</label>
          <input
            id="totp-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            value={totpCode}
            onChange={(event) => setTotpCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
            required
            autoFocus
          />
          {error ? <p className="error">{error}</p> : null}
          <div className="form-footer">
            <button className="primary" type="submit" disabled={loading || totpCode.length !== 6}>
              {loading ? 'Prüfen…' : 'Bestätigen'}
            </button>
            <button type="button" onClick={handleCancelMfa} disabled={loading}>
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="layout" style={{ maxWidth: 420 }}>
      <h1 style={{ color: '#a5d6a7' }}>CeliacSafe Admin</h1>
      {isDevAuthBypassEnabled() ? (
        <p className="dev-banner">Localhost-Dev: automatischer Login, 2FA aus</p>
      ) : (
        <p className="muted">Anmeldung über Supabase Auth (EU).</p>
      )}
      {!isDevAuthBypassEnabled() ? (
      <form onSubmit={handleCredentialsSubmit}>
        <label htmlFor="email">E-Mail</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
          autoComplete="username"
        />
        <label htmlFor="password">Passwort</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
          minLength={MIN_PASSWORD_LENGTH}
          autoComplete="current-password"
        />
        <p className="muted">Mindestens {MIN_PASSWORD_LENGTH} Zeichen.</p>
        {error ? <p className="error">{error}</p> : null}
        <button className="primary" type="submit" disabled={loading}>
          {loading ? 'Anmelden…' : 'Anmelden'}
        </button>
      </form>
      ) : null}
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
