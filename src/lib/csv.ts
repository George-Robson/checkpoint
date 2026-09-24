type CsvValue = string | number | null | undefined;

function escapeCell(value: CsvValue): string {
  const text = value === null || value === undefined ? '' : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

export function toCsv(headers: string[], rows: CsvValue[][]): string {
  return [headers, ...rows].map((row) => row.map(escapeCell).join(',')).join('\r\n');
}

/** Triggers a browser download of the given CSV content. */
export function downloadCsv(filename: string, csv: string): void {
  // Leading BOM so Excel opens UTF-8 (e.g. "·", "’") correctly.
  const blob = new Blob(['﻿', csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  // Revoke on the next tick; some browsers read the URL after click() returns.
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
