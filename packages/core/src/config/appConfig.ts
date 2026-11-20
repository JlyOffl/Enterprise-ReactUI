import type { LogLevel } from '../logging/types';

export type Environment = 'development' | 'staging' | 'production';

export interface AppConfig {
  appName: string;
  version: string;
  environment: Environment;
  apiBaseUrl: string;
  /** When true the in-process mock server answers every API call (no backend required). */
  useMockApi: boolean;
  /** Identifier of THIS client system, sent as X-External-System-Id to downstream services. */
  externalSystemId: string;
  logLevel: LogLevel;
  requestTimeoutMs: number;
  healthCheckIntervalMs: number;
  featureFlagRefreshMs: number;
  dynatrace: { enabled: boolean; applicationId?: string };
  defaultLocale: string;
  supportedLocales: string[];
}

export const defaultConfig: AppConfig = {
  appName: 'Enterprise ReactUI',
  version: '1.0.0',
  environment: 'development',
  apiBaseUrl: 'https://api.example.com/v1',
  useMockApi: true,
  externalSystemId: 'ERUI-CLIENT',
  logLevel: 'debug',
  requestTimeoutMs: 15_000,
  healthCheckIntervalMs: 30_000,
  featureFlagRefreshMs: 5 * 60_000,
  dynatrace: { enabled: false },
  defaultLocale: 'en',
  supportedLocales: ['en', 'es', 'fr'],
};

export function createConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    ...defaultConfig,
    ...overrides,
    dynatrace: { ...defaultConfig.dynatrace, ...overrides.dynatrace },
  };
}
