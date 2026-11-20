import { createAction } from '@reduxjs/toolkit';
import type { AccentName } from '../theme/createTheme';
import type { ThemeMode } from '../theme/themeSlice';
import type { Density, NavLayoutPreference } from '../ui/uiSlice';

/** User preferences persisted to device storage and restored at startup. */
export interface PersistedPreferences {
  themeMode?: ThemeMode;
  accent?: AccentName;
  locale?: string;
  navLayout?: NavLayoutPreference;
  density?: Density;
  flagOverrides?: Record<string, boolean>;
}

export const preferencesRestored = createAction<PersistedPreferences>('preferences/restored');
export const preferencesReset = createAction('preferences/reset');
