import { useCallback, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createTheme, type AccentName, type Theme } from './createTheme';
import { accentChanged, selectThemeState, themeModeChanged, type ThemeMode } from './themeSlice';

export interface UseThemeResult extends Theme {
  mode: ThemeMode;
  setMode(mode: ThemeMode): void;
  setAccent(accent: AccentName): void;
  toggleScheme(): void;
}

/** Resolved theme object + theme commands. Same API on web and native. */
export function useTheme(): UseThemeResult {
  const { mode, accent, systemScheme } = useAppSelector(selectThemeState);
  const dispatch = useAppDispatch();
  const scheme = mode === 'system' ? systemScheme : mode;
  const theme = useMemo(() => createTheme(scheme, accent), [scheme, accent]);
  const setMode = useCallback((m: ThemeMode) => dispatch(themeModeChanged(m)), [dispatch]);
  const setAccent = useCallback((a: AccentName) => dispatch(accentChanged(a)), [dispatch]);
  const toggleScheme = useCallback(
    () => dispatch(themeModeChanged(scheme === 'dark' ? 'light' : 'dark')),
    [dispatch, scheme],
  );
  return useMemo(() => ({ ...theme, mode, setMode, setAccent, toggleScheme }), [theme, mode, setMode, setAccent, toggleScheme]);
}
