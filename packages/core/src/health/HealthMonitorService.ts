import type { Dispatch } from '@reduxjs/toolkit';
import { createId, now } from '../utils/id';
import { getErrorMessage } from '../utils/errors';
import type { Logger } from '../logging/Logger';
import type { AnalyticsService } from '../instrumentation/AnalyticsService';
import type { DynatraceBridge } from '../dynatrace/types';
import type { AppConfig } from '../config/appConfig';
import { alertRaised, healthRunCompleted, monitoringToggled } from './healthSlice';
import type { AlertSeverity, HealthCheck, HealthCheckResult, HealthStatus } from './types';

const rank: Record<HealthStatus, number> = { healthy: 0, unknown: 1, degraded: 2, unhealthy: 3 };

/**
 * Health monitoring & alerting.
 * Periodically runs registered checks, aggregates an overall status, records history, and raises
 * alerts (Redux + logger + Dynatrace event) on status transitions.
 */
export class HealthMonitorService {
  private checks = new Map<string, HealthCheck>();
  private timer: ReturnType<typeof setInterval> | undefined;
  private lastOverall: HealthStatus = 'unknown';
  private running = false;
  private readonly log: Logger;

  constructor(
    logger: Logger,
    private readonly analytics: AnalyticsService,
    private readonly dynatrace: DynatraceBridge,
    private readonly config: AppConfig,
  ) {
    this.log = logger.child('health');
  }

  register(check: HealthCheck): void {
    this.checks.set(check.name, check);
  }

  getChecks(): HealthCheck[] {
    return [...this.checks.values()];
  }

  start(dispatch: Dispatch, intervalMs = this.config.healthCheckIntervalMs): void {
    this.stop(dispatch);
    dispatch(monitoringToggled(true));
    void this.runOnce(dispatch);
    this.timer = setInterval(() => void this.runOnce(dispatch), intervalMs);
    this.log.info('Health monitoring started', { intervalMs });
  }

  stop(dispatch?: Dispatch): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = undefined;
    dispatch?.(monitoringToggled(false));
  }

  isRunning() {
    return this.timer !== undefined;
  }

  async runOnce(dispatch: Dispatch): Promise<HealthStatus> {
    if (this.running) return this.lastOverall;
    this.running = true;
    try {
      const results = await Promise.all([...this.checks.values()].map((c) => this.execute(c)));
      const overall = this.aggregate(results);
      dispatch(healthRunCompleted({ overall, results }));
      this.evaluateTransition(overall, results, dispatch);
      this.lastOverall = overall;
      return overall;
    } finally {
      this.running = false;
    }
  }

  private async execute(check: HealthCheck): Promise<HealthCheckResult> {
    const start = now();
    const timeoutMs = check.timeoutMs ?? 5_000;
    try {
      const outcome = await Promise.race([
        check.run(),
        new Promise<never>((_, reject) => setTimeout(() => reject(new Error(`Timed out after ${timeoutMs}ms`)), timeoutMs)),
      ]);
      return {
        ...outcome,
        latencyMs: outcome.latencyMs ?? Math.round(now() - start),
        name: check.name,
        critical: !!check.critical,
        checkedAt: new Date().toISOString(),
      };
    } catch (error) {
      return {
        name: check.name,
        critical: !!check.critical,
        status: 'unhealthy',
        message: getErrorMessage(error),
        latencyMs: Math.round(now() - start),
        checkedAt: new Date().toISOString(),
      };
    }
  }

  private aggregate(results: HealthCheckResult[]): HealthStatus {
    if (!results.length) return 'unknown';
    let worst: HealthStatus = 'healthy';
    for (const r of results) {
      // A failing non-critical check can only degrade the system.
      const effective: HealthStatus = !r.critical && r.status === 'unhealthy' ? 'degraded' : r.status;
      if (rank[effective] > rank[worst]) worst = effective;
    }
    return worst;
  }

  private evaluateTransition(overall: HealthStatus, results: HealthCheckResult[], dispatch: Dispatch) {
    if (overall === this.lastOverall) return;
    const failing = results.filter((r) => r.status !== 'healthy').map((r) => r.name);
    const recovered = rank[overall] < rank[this.lastOverall] && overall === 'healthy';
    const severity: AlertSeverity = recovered ? 'info' : overall === 'unhealthy' ? 'critical' : 'warning';
    const title = recovered ? 'System recovered' : `System ${overall}`;
    const message = recovered ? 'All health checks are passing again.' : `Failing checks: ${failing.join(', ') || 'n/a'}`;

    if (this.lastOverall === 'unknown' && overall === 'healthy') return; // first healthy run is not an alert

    dispatch(
      alertRaised({
        id: createId('alert'),
        severity,
        title,
        message,
        source: 'health-monitor',
        raisedAt: new Date().toISOString(),
        acknowledged: false,
      }),
    );
    this.log.log(severity === 'critical' ? 'error' : severity === 'warning' ? 'warn' : 'info', title, {
      failing: failing.join(','),
    });
    this.dynatrace.reportEvent('health.alert', { severity, overall, failing: failing.join(',') });
    this.analytics.track('health.status_changed', { from: this.lastOverall, to: overall });
  }
}
