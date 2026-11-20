import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { localeChanged, selectLocale } from '../ui/uiSlice';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercent,
  formatRelativeTime,
} from '../utils/format';
import { LOCALES } from './i18n';
import { parseValidationMessage } from '../validation/messages';

/** Locale state, switching and locale-aware formatters. */
export function useLocale() {
  const locale = useAppSelector(selectLocale);
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const setLocale = useCallback((code: string) => dispatch(localeChanged(code)), [dispatch]);

  const formatters = useMemo(
    () => ({
      currency: (v: number, currency = 'USD') => formatCurrency(v, locale, currency),
      number: (v: number, o?: Intl.NumberFormatOptions) => formatNumber(v, locale, o),
      percent: (v: number) => formatPercent(v, locale),
      date: (v: string | number | Date, o?: Intl.DateTimeFormatOptions) => formatDate(v, locale, o),
      dateTime: (v: string | number | Date) => formatDateTime(v, locale),
      relative: (v: string | number | Date) => formatRelativeTime(v, locale),
    }),
    [locale],
  );

  return {
    t,
    locale,
    setLocale,
    locales: LOCALES,
    dir: LOCALES.find((l) => l.code === locale)?.dir ?? 'ltr',
    format: formatters,
  };
}

/** Translates validation messages produced by the shared zod schemas (key + params). */
export function useValidationMessage() {
  const { t } = useTranslation();
  return useCallback(
    (message?: string) => {
      if (!message) return undefined;
      const { key, params } = parseValidationMessage(message);
      return t(key, params as Record<string, unknown>) as string;
    },
    [t],
  );
}
