import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { HealthAlert, HealthCheckResult, HealthStatus } from './types';

export interface HealthState {
  overall: HealthStatus;
  checks: Record<string, HealthCheckResult>;
  history: Array<{ at: string; overall: HealthStatus; latencyMs?: number }>;
  alerts: HealthAlert[];
  monitoring: boolean;
  lastRunAt: string | null;
}

const initialState: HealthState = {
  overall: 'unknown',
  checks: {},
  history: [],
  alerts: [],
  monitoring: false,
  lastRunAt: null,
};

export const healthSlice = createSlice({
  name: 'health',
  initialState,
  reducers: {
    healthRunCompleted(state, action: PayloadAction<{ overall: HealthStatus; results: HealthCheckResult[] }>) {
      state.overall = action.payload.overall;
      for (const r of action.payload.results) state.checks[r.name] = r;
      const at = new Date().toISOString();
      state.lastRunAt = at;
      const api = action.payload.results.find((r) => r.name === 'api');
      state.history = [...state.history, { at, overall: action.payload.overall, latencyMs: api?.latencyMs }].slice(-40);
    },
    monitoringToggled(state, action: PayloadAction<boolean>) {
      state.monitoring = action.payload;
    },
    alertRaised(state, action: PayloadAction<HealthAlert>) {
      state.alerts = [action.payload, ...state.alerts].slice(0, 50);
    },
    alertAcknowledged(state, action: PayloadAction<string>) {
      const alert = state.alerts.find((a) => a.id === action.payload);
      if (alert) alert.acknowledged = true;
    },
    alertsCleared(state) {
      state.alerts = [];
    },
  },
  selectors: {
    selectHealth: (s) => s,
    selectOverallHealth: (s) => s.overall,
  },
});

export const { healthRunCompleted, monitoringToggled, alertRaised, alertAcknowledged, alertsCleared } =
  healthSlice.actions;
export const { selectHealth, selectOverallHealth } = healthSlice.selectors;
