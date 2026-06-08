import { useState } from 'react';
import {
  isValidSubmissionStatus,
  parseCsvRecords,
  sanitizeRestaurantId,
  validateCsvFile,
} from '../lib/csvImport';
import { supabase } from '../lib/supabase';

export default function ImportPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File) => {
    setMessage(null);
    setError(null);

    const fileError = validateCsvFile(file);
    if (fileError) {
      setError(fileError);
      return;
    }

    setBusy(true);
    try {
      const text = await file.text();
      const { kind, records } = parseCsvRecords(text);
      let imported = 0;
      const failures: string[] = [];

      for (let i = 0; i < records.length; i += 1) {
        const record = records[i];

        if (kind === 'submissions') {
          if (!record.restaurant_name || !record.city) {
            continue;
          }

          const status = record.submission_status || record.status || 'pending';
          if (!isValidSubmissionStatus(status)) {
            failures.push(`Zeile ${i + 2}: ungültiger Status «${status}»`);
            continue;
          }

          const id = sanitizeRestaurantId(
            record.id,
            `sub_admin_${Date.now()}_${i}`
          );

          const { error: err } = await supabase.from('submissions').upsert({
            id,
            restaurant_name: record.restaurant_name,
            city: record.city,
            country_code: record.country_code || 'ES',
            address: record.address || null,
            website: record.website || null,
            phone: record.phone || null,
            submission_notes: record.submission_notes || null,
            submitted_by_email: record.submitted_by_email || null,
            status,
            source: 'admin',
          });

          if (err) {
            failures.push(`Zeile ${i + 2}: ${err.message}`);
          } else {
            imported += 1;
          }
        } else {
          if (!record.name || !record.city || !record.region_code) {
            continue;
          }

          const id = sanitizeRestaurantId(record.id, `es_admin_${Date.now()}_${i}`);
          const latitude = record.latitude ? Number(record.latitude) : null;
          const longitude = record.longitude ? Number(record.longitude) : null;

          if (record.latitude && Number.isNaN(latitude)) {
            failures.push(`Zeile ${i + 2}: ungültige latitude`);
            continue;
          }
          if (record.longitude && Number.isNaN(longitude)) {
            failures.push(`Zeile ${i + 2}: ungültige longitude`);
            continue;
          }

          const { error: err } = await supabase.from('restaurants').upsert({
            id,
            name: record.name,
            slug: record.slug || null,
            country_code: record.country_code || 'ES',
            region_code: record.region_code,
            region_name: record.region_name || record.region_code,
            city: record.city,
            verification_status: record.verification_status || 'to_be_verified',
            latitude,
            longitude,
            is_published: record.is_published !== 'false',
            is_hidden: record.is_hidden === 'true',
            is_premium_partner: record.is_premium_partner === 'true',
          });

          if (err) {
            failures.push(`Zeile ${i + 2}: ${err.message}`);
          } else {
            imported += 1;
          }
        }
      }

      const kindLabel = kind === 'submissions' ? 'Vorschläge' : 'Restaurants';
      let summary = `${imported} Zeilen importiert (${kindLabel}).`;
      if (failures.length > 0) {
        summary += ` ${failures.length} Fehler.`;
        setError(failures.slice(0, 5).join('\n'));
      }
      setMessage(summary);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : String(caught));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <h2>CSV Import</h2>
      <p className="muted">
        Restaurants- oder Vorschläge-CSV (UTF-8, max. 2 MB, max. 500 Zeilen). Nur für Staff.
      </p>
      <input
        type="file"
        accept=".csv,text/csv"
        disabled={busy}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            handleFile(file).catch((err) => setError(String(err)));
          }
        }}
      />
      {message ? <p className="success">{message}</p> : null}
      {error ? <p className="error" style={{ whiteSpace: 'pre-wrap' }}>{error}</p> : null}
    </div>
  );
}
