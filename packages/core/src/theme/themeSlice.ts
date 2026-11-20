import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { preferencesReset, preferencesRestored } from '../store/actions';
import type { AccentName, ColorScheme } from './createTheme';

export type ThemeMode = ColorScheme | 'system';

export interface ThemeState {
  mode: ThemeMode;
  accent: AccentName;
  systemScheme: ColorScheme;
}

const initialState: ThemeState = { mode: 'system', accent: 'indigo', systemScheme: 'light' };

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    themeModeChanged: {
      reducer(state, action: PayloadAction<ThemeMode>) {
        state.mode = action.payload;
      },
      prepare: (mode: ThemeMode) => ({ payload: mode, meta: { analytics: { event: 'theme.mode_changed', properties: { mode } } } }),
    },
    accentChanged: {
      reducer(state, action: PayloadAction<AccentName>) {
        state.accent = action.payload;
      },
      prepare: (accent: AccentName) => ({ payload: accent, meta: { analytics: { event: 'theme.accent_changed', properties: { accent } } } }),
    },
    systemSchemeChanged(state, action: PayloadAction<ColorScheme>) {
      state.systemScheme = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(preferencesRestored, (state, action) => {
        if (action.payload.themeMode) state.mode = action.payload.themeMode;
        if (action.payload.accent) state.accent = action.payload.accent;
      })
      .addCase(preferencesReset, (state) => {
        state.mode = initialState.mode;
        state.accent = initialState.accent;
      });
  },
  selectors: {
    selectThemeState: (s) => s,
    selectResolvedScheme: (s): ColorScheme => (s.mode === 'system' ? s.systemScheme : s.mode),
  },
});

export const { themeModeChanged, accentChanged, systemSchemeChanged } = themeSlice.actions;
export const { selectThemeState, selectResolvedScheme } = themeSlice.selectors;
