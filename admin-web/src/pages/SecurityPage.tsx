import { FormEvent, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  confirmTotpEnrollment,
  enrollTotp,
  listVerifiedTotpFactors,
  unenrollTotpFactor,
} from '../lib/mfaAuth';

type EnrollState = {
  factorId: string;
  qrCode: string;
  secret: string;
};

export default function SecurityPage({ onEnrolled }: { onEnrolled?: () => void }) {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [factors, setFactors] = useState<{ id: string; friendly_name?: string }[]>([]);
  const [enroll, setEnroll] = useState<EnrollState | null>(null);
  const [confirmCode, setConfirmCode] = useState('');

  const refreshFactors = async () => {
    setLoading(true);
    const verified = await listVerifiedTotpFactors();
    setFactors(verified.map((factor) => ({ id: factor.id, friendly_name: factor.friendly_name })));
    setLoading(false);
  };

  useEffect(() => {
    refreshFactors().catch(() => setLoading(false));
  }, []);

  const handleStartEnroll = async () => {
    setBusy(true);
    setError(null);
    setSuccess(null);

    const { data, error: enrollError } = await enrollTotp();
    setBusy(false);

    if (enrollError || !data?.totp) {
      setError(enrollError?.message ?? 'MFA-Einrichtung fehlgeschlagen.');
      return;
    }

    setEnroll({
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
    });
    setConfirmCode('');
  };

  const handleConfirmEnroll = async (event: FormEvent) => {
    event.preventDefault();
    if (!enroll) {
      return;
    }

    setBusy(true);
    setError(null);
    setSuccess(null);

    const result = await confirmTotpEnrollment(enroll.factorId, confirmCode);
    setBusy(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setEnroll(null);
    setConfirmCode('');
    setSuccess('Zwei-Faktor-Authentifizierung ist aktiv.');
    onEnrolled?.();
    await refreshFactors();
  };

  const handleUnenroll = async (factorId: string) => {
    if (factors.length <= 1) {
      setError(
        'MFA ist für Admin-Zugang Pflicht. Richte zuerst einen zweiten Authenticator ein, bevor du diesen entfernst.'
      );
      return;
    }
    if (!window.confirm('Authenticator wirklich entfernen?')) {
      return;
    }

    setBusy(true);
    setError(null);
    setSuccess(null);

    const result = await unenrollTotpFactor(factorId);
    setBusy(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setSuccess('Authenticator entfernt.');
    await refreshFactors();
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <Link to="/" className="back-link">
            ← Dashboard
          </Link>
          <h2>Sicherheit</h2>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginTop: 0 }}>Zwei-Faktor-Authentifizierung (TOTP)</h3>
        <p className="muted">
          Schützt Admin-Zugang mit Codes aus Google Authenticator, 1Password, Authy o. Ä.
        </p>

        {loading ? <p className="muted">Lade…</p> : null}

        {!loading && factors.length === 0 && !enroll ? (
          <button className="primary" type="button" onClick={handleStartEnroll} disabled={busy}>
            Authenticator einrichten
          </button>
        ) : null}

        {!loading && factors.length > 0 ? (
          <ul>
            {factors.map((factor) => (
              <li key={factor.id}>
                {factor.friendly_name ?? 'Authenticator'}{' '}
                <span className="success">(aktiv)</span>{' '}
                <button type="button" onClick={() => handleUnenroll(factor.id)} disabled={busy}>
                  Entfernen
                </button>
              </li>
            ))}
          </ul>
        ) : null}

        {enroll ? (
          <form onSubmit={handleConfirmEnroll} style={{ marginTop: '1rem' }}>
            <p className="muted">QR-Code mit der Authenticator-App scannen:</p>
            <div
              className="mfa-qr"
              dangerouslySetInnerHTML={{ __html: enroll.qrCode }}
              aria-hidden
            />
            <p className="muted">
              Oder Secret manuell eingeben: <code>{enroll.secret}</code>
            </p>
            <label htmlFor="enroll-code">6-stelliger Code zur Bestätigung</label>
            <input
              id="enroll-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]{6}"
              maxLength={6}
              value={confirmCode}
              onChange={(event) => setConfirmCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              required
            />
            <div className="form-footer">
              <button className="primary" type="submit" disabled={busy || confirmCode.length !== 6}>
                {busy ? 'Speichern…' : 'Aktivieren'}
              </button>
              <button type="button" onClick={() => setEnroll(null)} disabled={busy}>
                Abbrechen
              </button>
            </div>
          </form>
        ) : null}

        {error ? <p className="error">{error}</p> : null}
        {success ? <p className="success">{success}</p> : null}
      </div>
    </div>
  );
}
