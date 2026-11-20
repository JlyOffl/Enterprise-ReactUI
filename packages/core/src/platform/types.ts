import type { DynatraceBridge } from '../dynatrace/types';
import type { HealthCheck } from '../health/types';
import type { PlatformLifecycleAdapter } from '../lifecycle/types';

/** Async key/value storage (localStorage on web, AsyncStorage / SecureStore on mobile). */
export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

export type PlatformKind = 'web' | 'ios' | 'android' | 'native';

export interface DeviceInfo {
  os: string;
  osVersion?: string;
  model?: string;
  userAgent?: string;
  screen?: { width: number; height: number };
}

/**
 * Everything the shared core needs from a host platform. Each UI project provides one
 * implementation; the core binds them into the IoC container.
 */
export interface PlatformServices {
  kind: PlatformKind;
  storage: KeyValueStorage;
  secureStorage: KeyValueStorage;
  lifecycle: PlatformLifecycleAdapter;
  dynatrace: DynatraceBridge;
  getDeviceInfo(): DeviceInfo;
  getDeviceLocale(): string;
  /** Extra platform specific health checks (memory, storage quota, ...). */
  healthChecks?: HealthCheck[];
}

export function isNativePlatform(kind: PlatformKind) {
  return kind !== 'web';
}

/** In-memory storage, useful for tests and SSR. */
export function createMemoryStorage(): KeyValueStorage {
  const map = new Map<string, string>();
  return {
    getItem: async (k) => map.get(k) ?? null,
    setItem: async (k, v) => {
      map.set(k, v);
    },
    removeItem: async (k) => {
      map.delete(k);
    },
  };
}
