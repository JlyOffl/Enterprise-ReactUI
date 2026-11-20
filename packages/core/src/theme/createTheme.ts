import { accents, breakpoints, motion, neutral, radii, spacing, status, typography, zIndex } from './tokens';

export type ColorScheme = 'light' | 'dark';
export type AccentName = keyof typeof accents;

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  surfaceRaised: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textSubtle: string;
  textInverse: string;
  primary: string;
  primaryHover: string;
  primarySoft: string;
  primaryContrast: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;
  focusRing: string;
  overlay: string;
  skeleton: string;
}

export interface Theme {
  scheme: ColorScheme;
  accent: AccentName;
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
  breakpoints: typeof breakpoints;
  motion: typeof motion;
  zIndex: typeof zIndex;
  shadows: { sm: string; md: string; lg: string };
  /** React Native elevation equivalents of shadows. */
  elevation: { sm: number; md: number; lg: number };
}

/** Builds a fully resolved theme from a color scheme + brand accent. */
export function createTheme(scheme: ColorScheme, accent: AccentName = 'indigo'): Theme {
  const a = accents[accent];
  const dark = scheme === 'dark';
  const colors: ThemeColors = dark
    ? {
        background: neutral[950],
        surface: neutral[900],
        surfaceAlt: neutral[850],
        surfaceRaised: neutral[800],
        border: 'rgba(148,163,184,0.18)',
        borderStrong: 'rgba(148,163,184,0.32)',
        text: neutral[100],
        textMuted: neutral[400],
        textSubtle: neutral[500],
        textInverse: neutral[900],
        primary: a[400],
        primaryHover: a[300],
        primarySoft: `rgba(${hexToRgb(a[400])},0.16)`,
        primaryContrast: neutral[950],
        success: status.success.dark,
        successSoft: status.success.softDark,
        warning: status.warning.dark,
        warningSoft: status.warning.softDark,
        danger: status.danger.dark,
        dangerSoft: status.danger.softDark,
        info: status.info.dark,
        infoSoft: status.info.softDark,
        focusRing: `rgba(${hexToRgb(a[400])},0.45)`,
        overlay: 'rgba(2,6,23,0.66)',
        skeleton: neutral[800],
      }
    : {
        background: neutral[50],
        surface: neutral[0],
        surfaceAlt: neutral[100],
        surfaceRaised: neutral[0],
        border: neutral[200],
        borderStrong: neutral[300],
        text: neutral[900],
        textMuted: neutral[600],
        textSubtle: neutral[400],
        textInverse: neutral[0],
        primary: a[600],
        primaryHover: a[700],
        primarySoft: a[50],
        primaryContrast: neutral[0],
        success: status.success.light,
        successSoft: status.success.softLight,
        warning: status.warning.light,
        warningSoft: status.warning.softLight,
        danger: status.danger.light,
        dangerSoft: status.danger.softLight,
        info: status.info.light,
        infoSoft: status.info.softLight,
        focusRing: `rgba(${hexToRgb(a[500])},0.35)`,
        overlay: 'rgba(15,23,42,0.45)',
        skeleton: neutral[200],
      };

  return {
    scheme,
    accent,
    colors,
    spacing,
    radii,
    typography,
    breakpoints,
    motion,
    zIndex,
    shadows: dark
      ? {
          sm: '0 1px 2px rgba(0,0,0,0.4)',
          md: '0 6px 16px -4px rgba(0,0,0,0.5)',
          lg: '0 24px 48px -12px rgba(0,0,0,0.6)',
        }
      : {
          sm: '0 1px 2px rgba(15,23,42,0.06)',
          md: '0 6px 16px -4px rgba(15,23,42,0.10), 0 2px 4px rgba(15,23,42,0.04)',
          lg: '0 24px 48px -12px rgba(15,23,42,0.22)',
        },
    elevation: { sm: 1, md: 4, lg: 12 },
  };
}

export function hexToRgb(hex: string): string {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
}

export function withAlpha(hex: string, alpha: number): string {
  return `rgba(${hexToRgb(hex)},${alpha})`;
}

export const ACCENT_NAMES = Object.keys(accents) as AccentName[];
export const accentSwatches: Record<AccentName, string> = Object.fromEntries(
  ACCENT_NAMES.map((n) => [n, accents[n][500]]),
) as Record<AccentName, string>;
