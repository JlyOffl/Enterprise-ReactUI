import { useEffect, useLayoutEffect } from 'react';
import {
  selectDensity,
  systemSchemeChanged,
  useAppDispatch,
  useAppSelector,
  useLocale,
  useTheme,
  type Theme,
} from '@erui/core';

const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

/** Themes and Styles - Web: projects the shared theme object into CSS custom properties. */
export function themeToCssVars(theme: Theme): Record<string, string> {
  const vars: Record<string, string> = {};
  Object.entries(theme.colors).forEach(([k, v]) => (vars[`--c-${kebab(k)}`] = v));
  Object.entries(theme.radii).forEach(([k, v]) => (vars[`--r-${k}`] = `${v}px`));
  Object.entries(theme.shadows).forEach(([k, v]) => (vars[`--shadow-${k}`] = v));
  Object.entries(theme.spacing).forEach(([k, v]) => (vars[`--s-${k}`] = `${v}px`));
  Object.entries(theme.typography.size).forEach(([k, v]) => (vars[`--fs-${k}`] = `${v}px`));
  vars['--font-sans'] = theme.typography.fontFamily.sans;
  vars['--font-mono'] = theme.typography.fontFamily.mono;
  vars['--motion-fast'] = `${theme.motion.fast}ms`;
  vars['--motion-normal'] = `${theme.motion.normal}ms`;
  return vars;
}

export function ThemeStyleSync() {
  const theme = useTheme();
  const density = useAppSelector(selectDensity);
  const dispatch = useAppDispatch();
  const { locale, dir } = useLocale();

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => dispatch(systemSchemeChanged(mq.matches ? 'dark' : 'light'));
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, [dispatch]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    Object.entries(themeToCssVars(theme)).forEach(([k, v]) => root.style.setProperty(k, v));
    root.dataset.theme = theme.scheme;
    root.dataset.density = density;
    root.style.colorScheme = theme.scheme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.colors.primary);
  }, [theme, density]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = dir;
  }, [locale, dir]);

  return null;
}
