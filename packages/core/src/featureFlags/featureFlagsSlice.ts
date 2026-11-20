import { createSelector, createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { preferencesReset, preferencesRestored } from '../store/actions';
import { FLAG_DEFINITIONS } from './definitions';

export interface FeatureFlagsState {
  values: Record<string, boolean>;
  overrides: Record<string, boolean>;
  status: 'idle' | 'loading' | 'loaded' | 'error';
  source: 'defaults' | 'remote';
  lastLoadedAt: string | null;
}

const defaults = Object.fromEntries(FLAG_DEFINITIONS.map((d) => [d.key, d.defaultValue]));

const initialState: FeatureFlagsState = {
  values: defaults,
  overrides: {},
  status: 'idle',
  source: 'defaults',
  lastLoadedAt: null,
};

export const featureFlagsSlice = createSlice({
  name: 'featureFlags',
  initialState,
  reducers: {
    flagsLoading(state) {
      state.status = 'loading';
    },
    flagsLoaded(state, action: PayloadAction<{ values: Record<string, boolean>; source: 'defaults' | 'remote' }>) {
      state.values = { ...state.values, ...action.payload.values };
      state.source = action.payload.source;
      state.status = 'loaded';
      state.lastLoadedAt = new Date().toISOString();
    },
    flagsLoadFailed(state) {
      state.status = 'error';
    },
    flagOverridden(state, action: PayloadAction<{ key: string; value: boolean }>) {
      state.overrides[action.payload.key] = action.payload.value;
    },
    flagOverrideCleared(state, action: PayloadAction<string>) {
      delete state.overrides[action.payload];
    },
    flagOverridesReset(state) {
      state.overrides = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(preferencesRestored, (state, action) => {
        if (action.payload.flagOverrides) state.overrides = action.payload.flagOverrides;
      })
      .addCase(preferencesReset, (state) => {
        state.overrides = {};
      });
  },
  selectors: {
    selectFeatureFlags: (s) => s,
    selectFlag: (s, key: string): boolean => s.overrides[key] ?? s.values[key] ?? false,
  },
});

export const { flagsLoading, flagsLoaded, flagsLoadFailed, flagOverridden, flagOverrideCleared, flagOverridesReset } =
  featureFlagsSlice.actions;
export const { selectFeatureFlags, selectFlag } = featureFlagsSlice.selectors;

/** Memoized so components re-render only when flags actually change. */
export const selectEffectiveFlags = createSelector(
  [selectFeatureFlags],
  (s): Record<string, boolean> => ({ ...s.values, ...s.overrides }),
);
