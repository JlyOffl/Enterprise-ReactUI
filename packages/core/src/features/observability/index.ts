import { useCallback, useState } from 'react';
import { defineModule } from '../../composable/FeatureModule';
import { useService } from '../../di/DIProvider';
import { TYPES } from '../../di/tokens';
import { useObservableBuffer } from '../../utils/observableBuffer';
import { useAppLifecycle } from '../../lifecycle/hooks';
import { useAnalytics } from '../../instrumentation/hooks';
import { mockControl } from '../../api/mock/mockServer';
import type { Logger } from '../../logging/Logger';
import type { MemoryLogHandler } from '../../logging/handlers';
import type { LogLevel } from '../../logging/types';
import type { MemoryAnalyticsHandler } from '../../instrumentation/AnalyticsService';
import type { ObservableDynatraceBridge } from '../../dynatrace/types';
import type { AppConfig } from '../../config/appConfig';

export const platformAdminModule = defineModule({
  id: 'platform-admin',
  navItems: [
    { id: 'featureFlags', path: '/feature-flags', labelKey: 'nav.featureFlags', icon: 'flag', section: 'admin', order: 70, permission: 'flags:manage' },
    { id: 'observability', path: '/observability', labelKey: 'nav.observability', icon: 'activity', section: 'admin', order: 75, permission: 'observability:read' },
    { id: 'settings', path: '/settings', labelKey: 'nav.settings', icon: 'settings', section: 'admin', order: 90 },
  ],
});

/** Observability console view-model: logs, analytics, Dynatrace outbox, lifecycle, chaos controls. */
export function useObservability() {
  const logger = useService<Logger>(TYPES.Logger);
  const memoryLogs = useService<MemoryLogHandler>(TYPES.MemoryLogHandler);
  const memoryAnalytics = useService<MemoryAnalyticsHandler>(TYPES.MemoryAnalyticsHandler);
  const dynatrace = useService<ObservableDynatraceBridge>(TYPES.DynatraceBridge);
  const config = useService<AppConfig>(TYPES.Config);
  const analytics = useAnalytics();
  const lifecycle = useAppLifecycle();

  const logs = useObservableBuffer(memoryLogs.buffer);
  const events = useObservableBuffer(memoryAnalytics.buffer);
  const dynatraceCalls = useObservableBuffer(dynatrace.calls);

  const [levelFilter, setLevelFilter] = useState<LogLevel | 'all'>('all');
  const [minLevel, setMinLevelState] = useState<LogLevel>(logger.getLevel());
  const [chaos, setChaos] = useState({ failureRate: mockControl.failureRate, healthMode: mockControl.healthMode });

  const demoLog = logger.child('observability-demo');

  return {
    logs: levelFilter === 'all' ? logs : logs.filter((l) => l.level === levelFilter),
    levelFilter,
    setLevelFilter,
    minLevel,
    setMinLevel: useCallback(
      (level: LogLevel) => {
        logger.setLevel(level);
        setMinLevelState(level);
      },
      [logger],
    ),
    clearLogs: () => memoryLogs.buffer.clear(),
    emitLog: (level: LogLevel, message: string) => demoLog.log(level, message, { source: 'console', at: Date.now() }),
    throwHandledError: () => {
      try {
        JSON.parse('{ invalid json');
      } catch (e) {
        demoLog.error('Handled parsing error captured', e, { feature: 'observability' });
      }
    },
    events,
    clearEvents: () => memoryAnalytics.buffer.clear(),
    trackTestEvent: () => analytics.track('observability.test_event', { random: Math.round(Math.random() * 100) }),
    dynatraceCalls,
    dynatraceAvailable: dynatrace.isAvailable(),
    dynatraceEnabled: config.dynatrace.enabled,
    clearDynatrace: () => dynatrace.calls.clear(),
    lifecycle,
    chaos,
    setFailureRate: (rate: number) => {
      mockControl.failureRate = rate;
      setChaos((c) => ({ ...c, failureRate: rate }));
    },
    setHealthMode: (mode: typeof mockControl.healthMode) => {
      mockControl.healthMode = mode;
      setChaos((c) => ({ ...c, healthMode: mode }));
    },
    mockApi: config.useMockApi,
  };
}
