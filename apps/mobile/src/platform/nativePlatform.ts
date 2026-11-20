import { Dimensions, Platform } from 'react-native';
import * as Localization from 'expo-localization';
import type { AppConfig, HealthCheck, LogLevel, PlatformServices } from '@erui/core';
import { nativeSecureStorage, nativeStorage } from './nativeStorage';
import { nativeLifecycleAdapter } from './nativeLifecycleAdapter';
import { DynatraceNativeBridge } from './dynatraceNativeBridge';

const nativeHealthChecks: HealthCheck[] = [
  {
    name: 'secure-storage',
    run: async () => {
      try {
        await nativeSecureStorage.setItem('erui.health', '1');
        await nativeSecureStorage.removeItem('erui.health');
        return { status: 'healthy', message: 'Keychain/Keystore available' };
      } catch {
        return { status: 'degraded', message: 'Secure storage unavailable' };
      }
    },
  },
];

/** React Native implementation of every platform contract the core needs. */
export function createNativePlatform(): PlatformServices {
  return {
    kind: Platform.OS === 'ios' ? 'ios' : Platform.OS === 'android' ? 'android' : 'native',
    storage: nativeStorage,
    secureStorage: nativeSecureStorage,
    lifecycle: nativeLifecycleAdapter,
    dynatrace: new DynatraceNativeBridge(),
    getDeviceInfo: () => {
      const { width, height } = Dimensions.get('window');
      return { os: Platform.OS, osVersion: String(Platform.Version), screen: { width, height } };
    },
    getDeviceLocale: () => Localization.getLocales()[0]?.languageTag ?? 'en',
    healthChecks: nativeHealthChecks,
  };
}

// Expo only inlines EXPO_PUBLIC_* when accessed as process.env.NAME (no destructuring).
export const nativeConfig: Partial<AppConfig> = {
  appName: 'Enterprise ReactUI',
  environment: (process.env.EXPO_PUBLIC_APP_ENV as AppConfig['environment']) ?? (__DEV__ ? 'development' : 'production'),
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://api.example.com/v1',
  useMockApi: (process.env.EXPO_PUBLIC_USE_MOCK_API ?? 'true') === 'true',
  externalSystemId: process.env.EXPO_PUBLIC_EXTERNAL_SYSTEM_ID ?? 'ERUI-MOBILE',
  logLevel: (process.env.EXPO_PUBLIC_LOG_LEVEL as LogLevel) ?? (__DEV__ ? 'debug' : 'info'),
  dynatrace: { enabled: process.env.EXPO_PUBLIC_DYNATRACE_ENABLED === 'true' },
};
