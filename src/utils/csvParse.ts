/**
 * Minimaler RFC-4180-CSV-Parser (Komma, Anführungszeichen, Zeilenumbrüche in Feldern).
 */

export function parseCsv(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const rows = parseCsvRows(text.trim());
  if (rows.length === 0) {
    return { headers: [], rows: [] };
  }

  const headers = rows[0].map(normalizeHeader);
  const data: Record<string, string>[] = [];

  for (let i = 1; i < rows.length; i += 1) {
    const cells = rows[i];
    if (cells.every((cell) => !cell.trim())) {
      continue;
    }
    const record: Record<string, string> = {};
    for (let col = 0; col < headers.length; col += 1) {
      const key = headers[col];
      if (!key) continue;
      record[key] = (cells[col] ?? '').trim();
    }
    data.push(record);
  }

  return { headers, rows: data };
}

function normalizeHeader(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '_');
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n' || (char === '\r' && next === '\n')) {
      row.push(field);
      field = '';
      if (row.some((cell) => cell.trim())) {
        rows.push(row);
      }
      row = [];
      if (char === '\r') i += 1;
    } else if (char !== '\r') {
      field += char;
    }
  }

  row.push(field);
  if (row.some((cell) => cell.trim())) {
    rows.push(row);
  }

  return rows;
}

export function toCsv(headers: string[], rows: Record<string, string>[]): string {
  const lines = [headers.map(escapeCsvCell).join(',')];
  for (const row of rows) {
    lines.push(headers.map((header) => escapeCsvCell(row[header] ?? '')).join(','));
  }
  return `${lines.join('\n')}\n`;
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
