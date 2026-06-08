import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

type AuditRow = {
  id: number;
  table_name: string;
  record_id: string;
  action: string;
  changed_by: string | null;
  created_at: string;
};

export default function AuditPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const { data, error: fetchError } = await supabase
        .from('audit_log')
        .select('id, table_name, record_id, action, changed_by, created_at')
        .order('created_at', { ascending: false })
        .limit(100);

      if (cancelled) {
        return;
      }

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setRows((data ?? []) as AuditRow[]);
      }
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div>
      <div className="page-header">
        <div>
          <Link to="/" className="back-link">
            ← Dashboard
          </Link>
          <h2>Audit-Log</h2>
        </div>
      </div>

      <p className="muted">Letzte 100 Änderungen an Restaurants, Vorschlägen und Links.</p>

      {loading ? <p className="muted">Lade…</p> : null}
      {error ? <p className="error">{error}</p> : null}

      {!loading && !error ? (
        <table>
          <thead>
            <tr>
              <th>Zeit</th>
              <th>Tabelle</th>
              <th>Aktion</th>
              <th>Datensatz</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{new Date(row.created_at).toLocaleString('de-DE')}</td>
                <td>{row.table_name}</td>
                <td>{row.action}</td>
                <td>{row.record_id}</td>
                <td className="muted">{row.changed_by?.slice(0, 8) ?? '—'}…</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {!loading && rows.length === 0 && !error ? (
        <p className="muted">Noch keine Einträge (Migration 008 anwenden).</p>
      ) : null}
    </div>
  );
}
