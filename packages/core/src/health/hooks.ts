import { useCallback } from 'react';
import { useService } from '../di/DIProvider';
import { TYPES } from '../di/tokens';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { alertAcknowledged, alertsCleared, selectHealth } from './healthSlice';
import type { HealthMonitorService } from './HealthMonitorService';
import type { HealthStatus } from './types';

export const healthStatusTone: Record<HealthStatus, 'success' | 'warning' | 'danger' | 'neutral'> = {
  healthy: 'success',
  degraded: 'warning',
  unhealthy: 'danger',
  unknown: 'neutral',
};

/** Health dashboard state + commands (run now, start/stop, acknowledge alerts). */
export function useHealthMonitor() {
  const health = useAppSelector(selectHealth);
  const dispatch = useAppDispatch();
  const monitor = useService<HealthMonitorService>(TYPES.HealthMonitorService);

  const runNow = useCallback(() => monitor.runOnce(dispatch), [monitor, dispatch]);
  const start = useCallback(() => monitor.start(dispatch), [monitor, dispatch]);
  const stop = useCallback(() => monitor.stop(dispatch), [monitor, dispatch]);
  const acknowledge = useCallback((id: string) => dispatch(alertAcknowledged(id)), [dispatch]);
  const clearAlerts = useCallback(() => dispatch(alertsCleared()), [dispatch]);

  return {
    ...health,
    checkList: Object.values(health.checks),
    openAlerts: health.alerts.filter((a) => !a.acknowledged),
    tone: healthStatusTone[health.overall],
    runNow,
    start,
    stop,
    acknowledge,
    clearAlerts,
  };
}
