import type { Dispatch } from '@reduxjs/toolkit';
import { now } from '../utils/id';
import { getErrorMessage } from '../utils/errors';
import type { Logger } from '../logging/Logger';
import type { AnalyticsService } from '../instrumentation/AnalyticsService';
import {
  bootFailed,
  connectivityChanged,
  phaseChanged,
  startupTaskCompleted,
  visibilityChanged,
} from './appSlice';
import type { AppVisibility, PlatformLifecycleAdapter, StartupTask } from './types';

type Listener = () => void;

/**
 * Application lifecycle (shared by web + mobile):
 * booting -> initializing (ordered startup tasks) -> ready | error,
 * plus foreground/background, connectivity and global error capture via the platform adapter.
 */
export class LifecycleService {
  private tasks: StartupTask[] = [];
  private subscriptions: Array<() => void> = [];
  private foregroundListeners = new Set<Listener>();
  private backgroundListeners = new Set<Listener>();
  private started = false;
  private abort = new AbortController();
  private readonly log: Logger;

  constructor(
    private readonly adapter: PlatformLifecycleAdapter,
    logger: Logger,
    private readonly analytics: AnalyticsService,
  ) {
    this.log = logger.child('lifecycle');
  }

  registerStartupTask(task: StartupTask): void {
    this.tasks.push(task);
  }

  onForeground(listener: Listener): () => void {
    this.foregroundListeners.add(listener);
    return () => this.foregroundListeners.delete(listener);
  }

  onBackground(listener: Listener): () => void {
    this.backgroundListeners.add(listener);
    return () => this.backgroundListeners.delete(listener);
  }

  async start(dispatch: Dispatch): Promise<void> {
    if (this.started) return;
    this.started = true;
    this.abort = new AbortController();
    const stopBoot = this.analytics.startTimer('app.boot');
    dispatch(phaseChanged('initializing'));
    dispatch(visibilityChanged(this.adapter.getInitialVisibility()));
    dispatch(connectivityChanged(this.adapter.getInitialOnline()));

    this.subscriptions.push(
      this.adapter.subscribeVisibility((v: AppVisibility) => {
        dispatch(visibilityChanged(v));
        this.log.info(`App moved to ${v}`);
        this.analytics.track(`app.${v}`);
        (v === 'foreground' ? this.foregroundListeners : this.backgroundListeners).forEach((l) => l());
      }),
      this.adapter.subscribeConnectivity((online) => {
        dispatch(connectivityChanged(online));
        this.log[online ? 'info' : 'warn'](online ? 'Connectivity restored' : 'Device went offline');
      }),
      this.adapter.subscribeGlobalErrors((error, isFatal) => {
        this.log[isFatal ? 'fatal' : 'error']('Unhandled global error', error, { isFatal });
      }),
    );
    if (this.adapter.subscribeBeforeExit) {
      this.subscriptions.push(this.adapter.subscribeBeforeExit(() => this.log.info('App exiting')));
    }

    const groups = new Map<number, StartupTask[]>();
    for (const task of this.tasks) {
      const order = task.order ?? 100;
      groups.set(order, [...(groups.get(order) ?? []), task]);
    }
    const ordered = [...groups.entries()].sort(([a], [b]) => a - b);

    try {
      for (const [, group] of ordered) {
        await Promise.all(group.map((task) => this.runTask(task, dispatch)));
      }
      dispatch(phaseChanged('ready'));
      this.log.info('Application ready');
      stopBoot({ outcome: 'ready' });
    } catch (error) {
      const message = getErrorMessage(error, 'Startup failed');
      dispatch(bootFailed(message));
      this.log.fatal('Application failed to start', error);
      stopBoot({ outcome: 'error' });
    }
  }

  private async runTask(task: StartupTask, dispatch: Dispatch) {
    const start = now();
    try {
      await task.run({ signal: this.abort.signal });
      const durationMs = Math.round(now() - start);
      dispatch(startupTaskCompleted({ name: task.name, durationMs, ok: true }));
      this.log.debug(`Startup task "${task.name}" finished`, { durationMs });
    } catch (error) {
      const durationMs = Math.round(now() - start);
      dispatch(startupTaskCompleted({ name: task.name, durationMs, ok: false, error: getErrorMessage(error) }));
      this.log.error(`Startup task "${task.name}" failed`, error);
      if (task.critical) throw error;
    }
  }

  dispose(): void {
    this.abort.abort();
    this.subscriptions.forEach((unsubscribe) => unsubscribe());
    this.subscriptions = [];
    this.started = false;
  }
}
