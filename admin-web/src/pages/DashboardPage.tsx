import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function DashboardPage() {
  const [stats, setStats] = useState({ restaurants: 0, pending: 0 });

  useEffect(() => {
    async function load() {
      const [r, s] = await Promise.all([
        supabase.from('restaurants').select('id', { count: 'exact', head: true }),
        supabase
          .from('submissions')
          .select('id', { count: 'exact', head: true })
          .in('status', ['pending', 'in_review']),
      ]);
      setStats({
        restaurants: r.count ?? 0,
        pending: s.count ?? 0,
      });
    }
    load().catch(console.error);
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="card">
        <p>
          <strong>{stats.restaurants}</strong> Restaurants in der Datenbank
        </p>
        <p>
          <strong>{stats.pending}</strong> offene Vorschläge
        </p>
      </div>
      <p className="muted">
        Nach Änderungen: <code>npm run data:export-supabase</code> → App-JSON aktualisieren
        oder später API-Sync in der App aktivieren.
      </p>
    </div>
  );
}
