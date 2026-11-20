import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AppVisibility, LifecyclePhase, StartupTiming } from './types';

export interface AppState {
  phase: LifecyclePhase;
  visibility: AppVisibility;
  online: boolean;
  startedAt: string | null;
  readyAt: string | null;
  lastForegroundAt: string | null;
  backgroundCount: number;
  bootError: string | null;
  startupTimings: StartupTiming[];
}

const initialState: AppState = {
  phase: 'booting',
  visibility: 'foreground',
  online: true,
  startedAt: null,
  readyAt: null,
  lastForegroundAt: null,
  backgroundCount: 0,
  bootError: null,
  startupTimings: [],
};

export const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    phaseChanged(state, action: PayloadAction<LifecyclePhase>) {
      state.phase = action.payload;
      if (action.payload === 'initializing') state.startedAt = new Date().toISOString();
      if (action.payload === 'ready') state.readyAt = new Date().toISOString();
    },
    visibilityChanged(state, action: PayloadAction<AppVisibility>) {
      if (state.visibility === action.payload) return;
      state.visibility = action.payload;
      if (action.payload === 'foreground') state.lastForegroundAt = new Date().toISOString();
      else state.backgroundCount += 1;
    },
    connectivityChanged(state, action: PayloadAction<boolean>) {
      state.online = action.payload;
    },
    startupTaskCompleted(state, action: PayloadAction<StartupTiming>) {
      state.startupTimings.push(action.payload);
    },
    bootFailed(state, action: PayloadAction<string>) {
      state.phase = 'error';
      state.bootError = action.payload;
    },
  },
  selectors: {
    selectPhase: (s) => s.phase,
    selectIsReady: (s) => s.phase === 'ready',
    selectIsOnline: (s) => s.online,
    selectVisibility: (s) => s.visibility,
    selectAppState: (s) => s,
  },
});

export const { phaseChanged, visibilityChanged, connectivityChanged, startupTaskCompleted, bootFailed } =
  appSlice.actions;
export const { selectPhase, selectIsReady, selectIsOnline, selectVisibility, selectAppState } = appSlice.selectors;
