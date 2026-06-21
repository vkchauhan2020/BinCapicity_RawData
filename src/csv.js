const HEADERS = ['Article', 'Case L', 'Case W', 'Case H', 'Weight (g)', 'EA/Box'];

export function escapeCsvField(value) {
  const str = String(value);
  if (/[",\n]/.test(str)) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

export function entriesToCsv(entries) {
  const rows = entries.map((e) => [
    e.article,
    e.l,
    e.w,
    e.h,
    Math.round(e.weightKg * 1000),
    e.eaPerBox,
  ]);
  const lines = [HEADERS, ...rows].map((row) => row.map(escapeCsvField).join(','));
  return lines.join('\r\n');
}

export function downloadCsv(filename, csvString) {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
