export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

export interface HealthCheckOutcome {
  status: HealthStatus;
  latencyMs?: number;
  message?: string;
}

export interface HealthCheckResult extends HealthCheckOutcome {
  name: string;
  critical: boolean;
  checkedAt: string;
}

export interface HealthCheck {
  name: string;
  /** Critical checks drive the overall status to `unhealthy` when they fail. */
  critical?: boolean;
  timeoutMs?: number;
  run(): Promise<HealthCheckOutcome>;
}

export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface HealthAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  message: string;
  source: string;
  raisedAt: string;
  acknowledged: boolean;
}
