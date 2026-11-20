import type { AppConfig, HealthCheck, PlatformServices } from '@erui/core';
import { webSecureStorage, webStorage } from './webStorage';
import { webLifecycleAdapter } from './webLifecycleAdapter';
import { DynatraceWebBridge, loadDynatraceRum } from './dynatraceWebBridge';

const webHealthChecks: HealthCheck[] = [
  {
    name: 'storage',
    run: async () => {
      try {
        localStorage.setItem('__health__', '1');
        localStorage.removeItem('__health__');
        return { status: 'healthy', message: 'localStorage writable' };
      } catch {
        return { status: 'degraded', message: 'localStorage unavailable' };
      }
    },
  },
  {
    name: 'js-heap',
    run: async () => {
      const memory = (performance as Performance & { memory?: { usedJSHeapSize: number; jsHeapSizeLimit: number } })
        .memory;
      if (!memory) return { status: 'healthy', message: 'n/a in this browser' };
      const ratio = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      return {
        status: ratio > 0.85 ? 'degraded' : 'healthy',
        message: `${Math.round(memory.usedJSHeapSize / 1048576)} MB (${Math.round(ratio * 100)}%)`,
      };
    },
  },
];

/** Web implementation of every platform contract the core needs. */
export function createWebPlatform(): PlatformServices {
  return {
    kind: 'web',
    storage: webStorage,
    secureStorage: webSecureStorage,
    lifecycle: webLifecycleAdapter,
    dynatrace: new DynatraceWebBridge(),
    getDeviceInfo: () => ({
      os: navigator.platform || 'web',
      userAgent: navigator.userAgent,
      screen: { width: window.screen.width, height: window.screen.height },
    }),
    getDeviceLocale: () => navigator.language || 'en',
    healthChecks: webHealthChecks,
  };
}

const env = import.meta.env;

export const webConfig: Partial<AppConfig> = {
  appName: 'Enterprise ReactUI',
  environment: env.VITE_APP_ENV ?? (env.PROD ? 'production' : 'development'),
  apiBaseUrl: env.VITE_API_BASE_URL ?? 'https://api.example.com/v1',
  useMockApi: (env.VITE_USE_MOCK_API ?? 'true') === 'true',
  externalSystemId: env.VITE_EXTERNAL_SYSTEM_ID ?? 'ERUI-WEB',
  logLevel: env.VITE_LOG_LEVEL ?? (env.PROD ? 'info' : 'debug'),
  dynatrace: { enabled: env.VITE_DYNATRACE_ENABLED === 'true' },
};

if (webConfig.dynatrace?.enabled) loadDynatraceRum(env.VITE_DYNATRACE_SCRIPT_URL);
