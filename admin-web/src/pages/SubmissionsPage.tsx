import { useEffect, useState } from 'react';
import { supabase, type SubmissionRow } from '../lib/supabase';

export default function SubmissionsPage() {
  const [rows, setRows] = useState<SubmissionRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const { data, error: err } = await supabase
      .from('submissions')
      .select('id,restaurant_name,city,status,submitted_at,submitted_by_email,submission_notes')
      .order('submitted_at', { ascending: false });
    if (err) setError(err.message);
    else setRows((data as SubmissionRow[]) ?? []);
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  const promote = async (row: SubmissionRow) => {
    const suffix =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID().replace(/-/g, '').slice(0, 12)
        : Math.random().toString(36).slice(2, 14);
    const restaurantId = `es_admin_${Date.now()}_${suffix}`.slice(0, 64);
    const { error: insertErr } = await supabase.from('restaurants').insert({
      id: restaurantId,
      name: row.restaurant_name,
      city: row.city,
      country_code: 'ES',
      region_code: 'ES-MD',
      region_name: 'Comunidad de Madrid',
      verification_status: 'to_be_verified',
      is_published: true,
      is_hidden: false,
    });
    if (insertErr) {
      setError(insertErr.message);
      return;
    }
    await supabase
      .from('submissions')
      .update({ status: 'promoted', promoted_to_restaurant_id: restaurantId })
      .eq('id', row.id);
    await load();
  };

  const reject = async (row: SubmissionRow) => {
    await supabase.from('submissions').update({ status: 'rejected' }).eq('id', row.id);
    await load();
  };

  return (
    <div>
      <h2>Vorschläge</h2>
      {error ? <p className="error">{error}</p> : null}
      {rows.map((row) => (
        <div className="card" key={row.id}>
          <strong>{row.restaurant_name}</strong> — {row.city}
          <div className="muted">
            {row.status} · {new Date(row.submitted_at).toLocaleString('de-DE')}
            {row.submitted_by_email ? ` · ${row.submitted_by_email}` : ''}
          </div>
          {row.submission_notes ? <p>{row.submission_notes}</p> : null}
          {row.status === 'pending' || row.status === 'in_review' ? (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button className="primary" type="button" onClick={() => promote(row)}>
                Übernehmen
              </button>
              <button type="button" onClick={() => reject(row)}>
                Ablehnen
              </button>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
