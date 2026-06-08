export const CSV_MAX_BYTES = 2 * 1024 * 1024;
export const CSV_MAX_ROWS = 500;

const RESTAURANT_REQUIRED = new Set(['name', 'city', 'region_code']);
const SUBMISSION_REQUIRED = new Set(['restaurant_name', 'city']);

const FIELD_MAX_LENGTH: Record<string, number> = {
  id: 64,
  name: 200,
  restaurant_name: 200,
  city: 100,
  slug: 120,
  region_code: 16,
  region_name: 120,
  website: 500,
  address: 500,
  submission_notes: 2000,
  submitted_by_email: 254,
};

export type CsvImportKind = 'restaurants' | 'submissions';

export function validateCsvFile(file: File): string | null {
  if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
    return 'Nur CSV-Dateien (.csv) sind erlaubt.';
  }
  if (file.size > CSV_MAX_BYTES) {
    return `Datei zu groß (max. ${Math.round(CSV_MAX_BYTES / 1024 / 1024)} MB).`;
  }
  return null;
}

export function parseCsvLine(text: string): string[][] {
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
      } else if (c === '"') {
        inQuotes = false;
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || (c === '\r' && n === '\n')) {
      row.push(field);
      if (row.some((x) => x.trim())) {
        rows.push(row);
      }
      row = [];
      field = '';
      if (c === '\r') {
        i += 1;
      }
    } else if (c !== '\r') {
      field += c;
    }
  }

  row.push(field);
  if (row.some((x) => x.trim())) {
    rows.push(row);
  }

  return rows;
}

export function detectCsvKind(headers: string[]): CsvImportKind | null {
  const normalized = headers.map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
  if (normalized.includes('restaurant_name') || normalized.includes('submission_notes')) {
    return 'submissions';
  }
  if (normalized.includes('name') && normalized.includes('region_code')) {
    return 'restaurants';
  }
  return null;
}

function trimField(key: string, value: string): string {
  const trimmed = value.trim();
  const max = FIELD_MAX_LENGTH[key];
  if (max && trimmed.length > max) {
    return trimmed.slice(0, max);
  }
  return trimmed;
}

export function parseCsvRecords(text: string): {
  kind: CsvImportKind;
  headers: string[];
  records: Record<string, string>[];
} {
  const rows = parseCsvLine(text.trim());
  if (rows.length < 2) {
    throw new Error('CSV leer oder ungültig.');
  }

  const dataRows = rows.slice(1);
  if (dataRows.length > CSV_MAX_ROWS) {
    throw new Error(`Zu viele Zeilen (max. ${CSV_MAX_ROWS}).`);
  }

  const headers = rows[0].map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'));
  const kind = detectCsvKind(headers);
  if (!kind) {
    throw new Error('CSV-Format nicht erkannt (Restaurants oder Vorschläge erwartet).');
  }

  const required = kind === 'submissions' ? SUBMISSION_REQUIRED : RESTAURANT_REQUIRED;
  for (const field of required) {
    if (!headers.includes(field)) {
      throw new Error(`Pflichtspalte fehlt: ${field}`);
    }
  }

  const records = dataRows.map((row) => {
    const record: Record<string, string> = {};
    headers.forEach((header, idx) => {
      if (header) {
        record[header] = trimField(header, row[idx] ?? '');
      }
    });
    return record;
  });

  return { kind, headers, records };
}

export function isValidSubmissionStatus(value: string): boolean {
  return ['pending', 'in_review', 'promoted', 'rejected'].includes(value);
}

export function sanitizeRestaurantId(raw: string, fallback: string): string {
  const id = (raw || fallback).trim().slice(0, 64);
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
    throw new Error(`Ungültige ID: ${id}`);
  }
  return id;
}
