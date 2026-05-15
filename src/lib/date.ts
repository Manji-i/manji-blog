const SQLITE_UTC_TIMESTAMP_RE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

export function parseApiDate(dateStr: string): Date {
  if (SQLITE_UTC_TIMESTAMP_RE.test(dateStr)) {
    return new Date(`${dateStr.replace(' ', 'T')}Z`);
  }

  return new Date(dateStr);
}

export function formatZhDate(dateStr: string): string {
  return parseApiDate(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatZhDateTime(dateStr: string): string {
  return parseApiDate(dateStr).toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
