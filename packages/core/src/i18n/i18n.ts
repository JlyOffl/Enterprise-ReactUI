import i18next, { type i18n as I18nInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './resources/en';
import { es } from './resources/es';
import { fr } from './resources/fr';

export const LOCALES = [
  { code: 'en', label: 'English', nativeLabel: 'English', dir: 'ltr' as const },
  { code: 'es', label: 'Spanish', nativeLabel: 'Español', dir: 'ltr' as const },
  { code: 'fr', label: 'French', nativeLabel: 'Français', dir: 'ltr' as const },
];

export const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
};

/** Resource localization: an isolated i18next instance per application. */
export function createI18n(initialLocale: string, supported: string[] = LOCALES.map((l) => l.code)): I18nInstance {
  const instance = i18next.createInstance();
  void instance.use(initReactI18next).init({
    resources,
    lng: supported.includes(initialLocale) ? initialLocale : 'en',
    fallbackLng: 'en',
    supportedLngs: supported,
    interpolation: { escapeValue: false },
    // allow plain sentences (with ':') to pass through t() untouched
    nsSeparator: false,
    // resources are bundled, so initialise synchronously (i18next v24+ option name)
    initAsync: false,
  });
  return instance;
}

/** Picks the best supported locale from a device locale like "es-MX". */
export function matchLocale(deviceLocale: string, supported: string[]): string {
  const lower = deviceLocale.toLowerCase();
  return supported.find((s) => s === lower) ?? supported.find((s) => lower.startsWith(s)) ?? 'en';
}
