import type { Container } from 'inversify';
import type { i18n as I18nInstance } from 'i18next';
import { TYPES } from '../di/tokens';
import { createAppContainer } from '../di/container';
import { createConfig, type AppConfig } from '../config/appConfig';
import type { PlatformServices } from '../platform/types';
import type { FeatureModule } from '../composable/FeatureModule';
import { coreModules } from '../features';
import { createI18n, matchLocale } from '../i18n/i18n';
import { createAppStore, type AppStore } from '../store/store';
import { preferencesRestored } from '../store/actions';
import type { Logger } from '../logging/Logger';
import type { AnalyticsService } from '../instrumentation/AnalyticsService';
import type { LifecycleService } from '../lifecycle/LifecycleService';
import type { HealthMonitorService } from '../health/HealthMonitorService';
import type { FeatureFlagService } from '../featureFlags/FeatureFlagService';
import { RemoteFlagProvider } from '../featureFlags/FeatureFlagService';
import type { AuthService } from '../auth/AuthService';
import type { PreferencesService } from '../preferences/PreferencesService';
import type { DynatraceBridge } from '../dynatrace/types';
import { flagsApi } from '../featureFlags/hooks';
import { flagsLoaded, flagsLoadFailed, flagsLoading } from '../featureFlags/featureFlagsSlice';
import { healthApi } from '../health/healthApi';
import { credentialsReceived, markedAnonymous, sessionExpired, sessionRestoreStarted } from '../auth/authSlice';
import { getErrorMessage } from '../utils/errors';

export interface CreateApplicationOptions {
  platform: PlatformServices;
  config?: Partial<AppConfig>;
  modules?: FeatureModule[];
}

export interface Application {
  config: AppConfig;
  container: Container;
  store: AppStore;
  i18n: I18nInstance;
  start(): Promise<void>;
  dispose(): void;
}

/**
 * Application bootstrap shared by web and mobile:
 * container -> i18n -> store -> health checks -> startup tasks -> start lifecycle.
 */
export function createApplication({ platform, config: overrides, modules = coreModules }: CreateApplicationOptions): Application {
  const config = createConfig(overrides);
  const container = createAppContainer(platform, config, modules);

  const initialLocale = matchLocale(platform.getDeviceLocale(), config.supportedLocales);
  const i18n = createI18n(initialLocale, config.supportedLocales);
  container.bind(TYPES.I18n).toConstantValue(i18n);

  const store = createAppStore(container);
  store.dispatch(preferencesRestored({ locale: initialLocale }));

  const logger = container.get<Logger>(TYPES.Logger);
  const analytics = container.get<AnalyticsService>(TYPES.AnalyticsService);
  const lifecycle = container.get<LifecycleService>(TYPES.LifecycleService);
  const health = container.get<HealthMonitorService>(TYPES.HealthMonitorService);
  const flags = container.get<FeatureFlagService>(TYPES.FeatureFlagService);
  const auth = container.get<AuthService>(TYPES.AuthService);
  const prefs = container.get<PreferencesService>(TYPES.PreferencesService);
  const dynatrace = container.get<DynatraceBridge>(TYPES.DynatraceBridge);

  logger.setContextProvider(() => {
    const s = store.getState();
    return { userId: s.auth.user?.id, locale: s.ui.locale, online: s.app.online };
  });
  analytics.register({ platform: platform.kind, appVersion: config.version, env: config.environment });

  // Feature flags: defaults + remote config
  flags.addProvider(
    new RemoteFlagProvider(() =>
      store.dispatch(flagsApi.endpoints.getFeatureFlags.initiate(undefined, { subscribe: false, forceRefetch: true })).unwrap(),
    ),
  );

  // Health checks -------------------------------------------------------------------------
  health.register({
    name: 'api',
    critical: true,
    run: async () => {
      const res = await store.dispatch(healthApi.endpoints.getHealth.initiate(undefined, { subscribe: false, forceRefetch: true }));
      if (res.error || !res.data) return { status: 'unhealthy', message: getErrorMessage(res.error, 'API unreachable') };
      const degraded = res.data.dependencies.filter((d) => d.status !== 'ok').map((d) => d.name);
      return {
        status: res.data.status === 'ok' ? 'healthy' : res.data.status === 'degraded' ? 'degraded' : 'unhealthy',
        message: degraded.length ? `Degraded: ${degraded.join(', ')}` : `v${res.data.version}`,
      };
    },
  });
  health.register({
    name: 'connectivity',
    run: async () =>
      store.getState().app.online ? { status: 'healthy', message: 'Online' } : { status: 'unhealthy', message: 'Offline' },
  });
  health.register({
    name: 'session',
    run: async () => {
      const a = store.getState().auth;
      if (a.status !== 'authenticated') return { status: 'healthy', message: 'Anonymous' };
      const minutes = Math.round(auth.millisecondsUntilExpiry(a.expiresAt) / 60_000);
      return { status: minutes < 5 ? 'degraded' : 'healthy', message: `Expires in ${minutes} min` };
    },
  });
  health.register({
    name: 'dynatrace',
    run: async () =>
      !config.dynatrace.enabled
        ? { status: 'healthy', message: 'Disabled (dry run)' }
        : dynatrace.isAvailable()
          ? { status: 'healthy', message: 'Agent connected' }
          : { status: 'degraded', message: 'Agent not detected' },
  });
  platform.healthChecks?.forEach((check) => health.register(check));

  // Startup tasks -------------------------------------------------------------------------
  lifecycle.registerStartupTask({
    name: 'restore-preferences',
    order: 10,
    run: async () => {
      store.dispatch(preferencesRestored(await prefs.load()));
    },
  });
  lifecycle.registerStartupTask({
    name: 'restore-session',
    order: 20,
    run: async () => {
      store.dispatch(sessionRestoreStarted());
      try {
        const session = await auth.loadSession();
        store.dispatch(session ? credentialsReceived({ ...session, restored: true }) : markedAnonymous());
      } catch (error) {
        store.dispatch(markedAnonymous());
        throw error;
      }
    },
  });
  lifecycle.registerStartupTask({
    name: 'load-feature-flags',
    order: 20,
    run: async () => {
      store.dispatch(flagsLoading());
      try {
        store.dispatch(flagsLoaded(await flags.load({ platform: platform.kind, appVersion: config.version })));
      } catch (error) {
        store.dispatch(flagsLoadFailed());
        throw error;
      }
    },
  });
  modules
    .filter((m) => m.onInit)
    .forEach((m) =>
      lifecycle.registerStartupTask({ name: `module:${m.id}`, order: 30, run: () => m.onInit!({ container, store }) }),
    );

  // Session expiry check whenever the app returns to the foreground.
  lifecycle.onForeground(() => {
    const a = store.getState().auth;
    if (a.status === 'authenticated' && auth.isExpired(a.expiresAt)) store.dispatch(sessionExpired());
  });

  let flagTimer: ReturnType<typeof setInterval> | undefined;
  // guards against start/dispose/start (React StrictMode) leaking timers
  let generation = 0;

  return {
    config,
    container,
    store,
    i18n,
    async start() {
      const current = ++generation;
      await lifecycle.start(store.dispatch);
      if (current !== generation) return;
      health.start(store.dispatch);
      if (flagTimer) clearInterval(flagTimer);
      flagTimer = setInterval(async () => {
        const user = store.getState().auth.user;
        store.dispatch(flagsLoaded(await flags.load({ userId: user?.id, roles: user?.roles, platform: platform.kind })));
      }, config.featureFlagRefreshMs);
    },
    dispose() {
      generation++;
      lifecycle.dispose();
      health.stop(store.dispatch);
      if (flagTimer) clearInterval(flagTimer);
      void logger.flush();
    },
  };
}
