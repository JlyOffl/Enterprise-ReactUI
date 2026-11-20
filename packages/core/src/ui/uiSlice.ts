import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { preferencesReset, preferencesRestored } from '../store/actions';

/** Tabs vs Hamburger: `auto` lets the shared layout rules decide per platform/viewport. */
export type NavLayoutPreference = 'auto' | 'tabs' | 'hamburger';
export type Density = 'comfortable' | 'compact';

export interface UiState {
  locale: string;
  navLayout: NavLayoutPreference;
  density: Density;
  sidebarCollapsed: boolean;
  mobileNavOpen: boolean;
}

const initialState: UiState = {
  locale: 'en',
  navLayout: 'auto',
  density: 'comfortable',
  sidebarCollapsed: false,
  mobileNavOpen: false,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    localeChanged: {
      reducer(state, action: PayloadAction<string>) {
        state.locale = action.payload;
      },
      prepare: (locale: string) => ({ payload: locale, meta: { analytics: { event: 'locale.changed', properties: { locale } } } }),
    },
    navLayoutChanged(state, action: PayloadAction<NavLayoutPreference>) {
      state.navLayout = action.payload;
    },
    densityChanged(state, action: PayloadAction<Density>) {
      state.density = action.payload;
    },
    sidebarToggled(state, action: PayloadAction<boolean | undefined>) {
      state.sidebarCollapsed = action.payload ?? !state.sidebarCollapsed;
    },
    mobileNavToggled(state, action: PayloadAction<boolean | undefined>) {
      state.mobileNavOpen = action.payload ?? !state.mobileNavOpen;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(preferencesRestored, (state, action) => {
        const p = action.payload;
        if (p.locale) state.locale = p.locale;
        if (p.navLayout) state.navLayout = p.navLayout;
        if (p.density) state.density = p.density;
      })
      .addCase(preferencesReset, (state) => {
        state.navLayout = initialState.navLayout;
        state.density = initialState.density;
      });
  },
  selectors: {
    selectUi: (s) => s,
    selectLocale: (s) => s.locale,
    selectNavLayoutPreference: (s) => s.navLayout,
    selectDensity: (s) => s.density,
  },
});

export const { localeChanged, navLayoutChanged, densityChanged, sidebarToggled, mobileNavToggled } = uiSlice.actions;
export const { selectUi, selectLocale, selectNavLayoutPreference, selectDensity } = uiSlice.selectors;
