import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    navigate('/');
  };

  return (
    <div className="layout" style={{ maxWidth: 420 }}>
      <h1 style={{ color: '#a5d6a7' }}>CeliacSafe Admin</h1>
      <p className="muted">Anmeldung über Supabase Auth (EU).</p>
      <form onSubmit={handleSubmit}>
        <label>E-Mail</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Passwort</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error ? <p className="error">{error}</p> : null}
        <button className="primary" type="submit" disabled={loading}>
          {loading ? 'Anmelden…' : 'Anmelden'}
        </button>
      </form>
    </div>
  );
}
