import { useEffect, useMemo } from 'react';
import { StyleSheet, useColorScheme } from 'react-native';
import { systemSchemeChanged, useAppDispatch, useTheme, type Theme } from '@erui/core';

/**
 * Themes and Styles - Mobile: StyleSheets derived from the shared theme object.
 * const useStyles = makeStyles((t) => ({ root: { backgroundColor: t.colors.surface } }));
 */
export function makeStyles<T extends StyleSheet.NamedStyles<T>>(factory: (theme: Theme) => T) {
  return function useStyles(): T {
    const theme = useTheme();
    return useMemo(() => StyleSheet.create(factory(theme)), [theme]);
  };
}

/** Keeps the shared theme state in sync with the device color scheme. */
export function NativeThemeSync() {
  const scheme = useColorScheme();
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(systemSchemeChanged(scheme === 'dark' ? 'dark' : 'light'));
  }, [scheme, dispatch]);
  return null;
}

export const shadow = (theme: Theme, level: 'sm' | 'md' | 'lg' = 'sm') => ({
  shadowColor: '#0f172a',
  shadowOpacity: theme.scheme === 'dark' ? 0.4 : level === 'lg' ? 0.18 : 0.08,
  shadowRadius: level === 'lg' ? 18 : level === 'md' ? 8 : 3,
  shadowOffset: { width: 0, height: level === 'lg' ? 10 : level === 'md' ? 4 : 1 },
  elevation: theme.elevation[level],
});
