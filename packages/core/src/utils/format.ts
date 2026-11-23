/** Locale-aware formatting helpers built on Intl (available on web and Hermes). */
export function formatCurrency(value: number, locale = 'en', currency = 'USD'): string {
  return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 }).format(value);
}

export function formatNumber(value: number, locale = 'en', options?: Intl.NumberFormatOptions): string {
  return new Intl.NumberFormat(locale, options).format(value);
}

export function formatPercent(value: number, locale = 'en', fractionDigits = 1): string {
  return new Intl.NumberFormat(locale, {
    style: 'percent',
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

export function formatDate(
  value: string | number | Date,
  locale = 'en',
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(locale, options).format(date);
}

export function formatDateTime(value: string | number | Date, locale = 'en'): string {
  return formatDate(value, locale, { dateStyle: 'medium', timeStyle: 'short' });
}

export function formatTime(value: string | number | Date, locale = 'en'): string {
  return formatDate(value, locale, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function formatRelativeTime(value: string | number | Date, locale = 'en'): string {
  const date = value instanceof Date ? value : new Date(value);
  const diffSec = Math.round((date.getTime() - Date.now()) / 1000);
  const abs = Math.abs(diffSec);
  const [amount, unit]: [number, Intl.RelativeTimeFormatUnit] =
    abs < 60
      ? [diffSec, 'second']
      : abs < 3600
        ? [Math.round(diffSec / 60), 'minute']
        : abs < 86400
          ? [Math.round(diffSec / 3600), 'hour']
          : [Math.round(diffSec / 86400), 'day'];
  // Hermes (React Native) does not ship Intl.RelativeTimeFormat on iOS.
  if (typeof Intl.RelativeTimeFormat === 'function') {
    return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(amount, unit);
  }
  if (amount === 0) return 'now';
  const n = Math.abs(amount);
  const label = `${n} ${unit}${n === 1 ? '' : 's'}`;
  return amount < 0 ? `${label} ago` : `in ${label}`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB'];
  let value = bytes / 1024;
  let i = 0;
  while (value >= 1024 && i < units.length - 1) {
    value /= 1024;
    i++;
  }
  return `${value.toFixed(1)} ${units[i]}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('');
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, '0');
  const d = `${date.getDate()}`.padStart(2, '0');
  return `${y}-${m}-${d}`;
}
