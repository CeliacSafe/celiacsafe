import { useState } from 'react';
import { supabase } from '../lib/supabase';

function parseCsvLine(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    const n = text[i + 1];
    if (inQuotes) {
      if (c === '"' && n === '"') {
        field += '"';
        i += 1;
      } else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || (c === '\r' && n === '\n')) {
      row.push(field);
      if (row.some((x) => x.trim())) rows.push(row);
      row = [];
      field = '';
      if (c === '\r') i += 1;
    } else if (c !== '\r') field += c;
  }
  row.push(field);
  if (row.some((x) => x.trim())) rows.push(row);
  return rows;
}

export default function ImportPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setMessage(null);
    setError(null);
    const text = await file.text();
    const rows = parseCsvLine(text.trim());
    if (rows.length < 2) {
      setError('CSV leer oder ungültig');
      return;
    }
    const headers = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
    const isSubmission = headers.includes('restaurant_name') || headers.includes('submission_notes');
    let imported = 0;

    for (let i = 1; i < rows.length; i += 1) {
      const record: Record<string, string> = {};
      headers.forEach((h, idx) => {
        record[h] = (rows[i][idx] ?? '').trim();
      });

      if (isSubmission) {
        if (!record.restaurant_name || !record.city) continue;
        const { error: err } = await supabase.from('submissions').upsert({
          id: record.id || `sub_csv_${Date.now()}_${i}`,
          restaurant_name: record.restaurant_name,
          city: record.city,
          country_code: record.country_code || 'ES',
          address: record.address || null,
          website: record.website || null,
          phone: record.phone || null,
          submission_notes: record.submission_notes || null,
          submitted_by_email: record.submitted_by_email || null,
          status: record.submission_status || 'pending',
          source: 'csv',
        });
        if (!err) imported += 1;
      } else {
        if (!record.name || !record.city || !record.region_code) continue;
        const { error: err } = await supabase.from('restaurants').upsert({
          id: record.id || `es_csv_${Date.now()}_${i}`,
          name: record.name,
          slug: record.slug || null,
          country_code: record.country_code || 'ES',
          region_code: record.region_code,
          region_name: record.region_name || record.region_code,
          city: record.city,
          verification_status: record.verification_status || 'to_be_verified',
          latitude: record.latitude ? Number(record.latitude) : null,
          longitude: record.longitude ? Number(record.longitude) : null,
          is_published: true,
          is_hidden: false,
        });
        if (!err) imported += 1;
      }
    }

    setMessage(`${imported} Zeilen importiert (${isSubmission ? 'Vorschläge' : 'Restaurants'}).`);
  };

  return (
    <div>
      <h2>CSV Import</h2>
      <p className="muted">Restaurants- oder Submissions-CSV (Excel-Export, UTF-8).</p>
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file).catch((err) => setError(String(err)));
        }}
      />
      {message ? <p style={{ color: '#a5d6a7' }}>{message}</p> : null}
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
