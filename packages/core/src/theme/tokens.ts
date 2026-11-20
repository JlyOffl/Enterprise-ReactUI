/** Design tokens shared by web (CSS variables) and native (StyleSheet). */
export const neutral = {
  0: '#ffffff',
  25: '#fcfcfd',
  50: '#f8fafc',
  100: '#f1f5f9',
  150: '#e9eef5',
  200: '#e2e8f0',
  300: '#cbd5e1',
  400: '#94a3b8',
  500: '#64748b',
  600: '#475569',
  700: '#334155',
  800: '#1e293b',
  850: '#172033',
  900: '#0f172a',
  950: '#0b1120',
} as const;

export const accents = {
  indigo: { 50: '#eef2ff', 100: '#e0e7ff', 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca' },
  blue: { 50: '#eff6ff', 100: '#dbeafe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' },
  teal: { 50: '#f0fdfa', 100: '#ccfbf1', 300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e' },
  violet: { 50: '#f5f3ff', 100: '#ede9fe', 300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9' },
  rose: { 50: '#fff1f2', 100: '#ffe4e6', 300: '#fda4af', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c' },
} as const;

export const status = {
  success: { light: '#16a34a', dark: '#22c55e', softLight: '#dcfce7', softDark: 'rgba(34,197,94,0.16)' },
  warning: { light: '#d97706', dark: '#f59e0b', softLight: '#fef3c7', softDark: 'rgba(245,158,11,0.16)' },
  danger: { light: '#dc2626', dark: '#f87171', softLight: '#fee2e2', softDark: 'rgba(248,113,113,0.16)' },
  info: { light: '#0284c7', dark: '#38bdf8', softLight: '#e0f2fe', softDark: 'rgba(56,189,248,0.16)' },
} as const;

export const spacing = { none: 0, xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 } as const;

export const radii = { none: 0, sm: 6, md: 10, lg: 14, xl: 20, full: 999 } as const;

export const typography = {
  fontFamily: {
    sans: 'Inter, "Segoe UI", system-ui, -apple-system, Roboto, "Helvetica Neue", Arial, sans-serif',
    mono: '"JetBrains Mono", "SFMono-Regular", Menlo, Consolas, monospace',
  },
  size: { xs: 12, sm: 13, md: 14, lg: 16, xl: 18, xxl: 22, xxxl: 28, display: 36 },
  weight: { regular: '400', medium: '500', semibold: '600', bold: '700' },
  lineHeight: { tight: 1.2, normal: 1.5, relaxed: 1.7 },
} as const;

export const breakpoints = { sm: 640, md: 768, lg: 1024, xl: 1280, xxl: 1536 } as const;

export const motion = { fast: 120, normal: 200, slow: 320 } as const;

export const zIndex = { base: 0, sticky: 100, drawer: 900, modeless: 950, modal: 1000, toast: 1100, tooltip: 1200 } as const;
