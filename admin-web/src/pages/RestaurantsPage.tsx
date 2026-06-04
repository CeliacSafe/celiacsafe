import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase, type RestaurantRow } from '../lib/supabase';

export default function RestaurantsPage() {
  const [rows, setRows] = useState<RestaurantRow[]>([]);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from('restaurants')
      .select('id,name,city,region_code,region_name,verification_status,is_published,is_hidden,updated_at')
      .order('name')
      .then(({ data, error: err }) => {
        if (err) setError(err.message);
        else setRows((data as RestaurantRow[]) ?? []);
      });
  }, []);

  const filtered = rows.filter(
    (r) =>
      !query ||
      r.name.toLowerCase().includes(query.toLowerCase()) ||
      r.city.toLowerCase().includes(query.toLowerCase())
  );

  const toggleHidden = async (row: RestaurantRow) => {
    const { error: err } = await supabase
      .from('restaurants')
      .update({ is_hidden: !row.is_hidden })
      .eq('id', row.id);
    if (err) {
      setError(err.message);
      return;
    }
    setRows((prev) =>
      prev.map((r) => (r.id === row.id ? { ...r, is_hidden: !row.is_hidden } : r))
    );
  };

  return (
    <div>
      <h2>Restaurants</h2>
      <input
        placeholder="Suchen…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {error ? <p className="error">{error}</p> : null}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Stadt</th>
            <th>Status</th>
            <th>Sichtbar</th>
            <th></th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((row) => (
            <tr key={row.id}>
              <td>
                <Link to={`/restaurants/${row.id}`}>{row.name}</Link>
              </td>
              <td>{row.city}</td>
              <td>{row.verification_status}</td>
              <td>{row.is_hidden ? 'Ausgeblendet' : 'Ja'}</td>
              <td>
                <Link to={`/restaurants/${row.id}`}>Bearbeiten</Link>
              </td>
              <td>
                <button type="button" onClick={() => toggleHidden(row)}>
                  {row.is_hidden ? 'Einblenden' : 'Ausblenden'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
