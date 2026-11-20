import 'reflect-metadata';
import { Container, type interfaces } from 'inversify';
import { TYPES } from './tokens';
import type { AppConfig } from '../config/appConfig';
import type { PlatformServices } from '../platform/types';
import type { FeatureModule } from '../composable/FeatureModule';
import { ModuleRegistry } from '../composable/ModuleRegistry';
import { Logger } from '../logging/Logger';
import { ConsoleLogHandler, DynatraceLogHandler, MemoryLogHandler } from '../logging/handlers';
import { NoopDynatraceBridge, ObservableDynatraceBridge, type DynatraceBridge } from '../dynatrace/types';
import {
  AnalyticsService,
  DynatraceAnalyticsHandler,
  LoggerAnalyticsHandler,
  MemoryAnalyticsHandler,
} from '../instrumentation/AnalyticsService';
import { LifecycleService } from '../lifecycle/LifecycleService';
import { AuthService } from '../auth/AuthService';
import { FeatureFlagService } from '../featureFlags/FeatureFlagService';
import { ExternalSystemService } from '../externalSystem/ExternalSystemService';
import { HealthMonitorService } from '../health/HealthMonitorService';
import { PreferencesService } from '../preferences/PreferencesService';

const get = <T>(ctx: interfaces.Context, id: interfaces.ServiceIdentifier<T>): T => ctx.container.get<T>(id);

/**
 * Composition root (Inversion of Control). Platform services are bound as constants,
 * core services as lazily created singletons, then each feature module registers its own.
 */
export function createAppContainer(platform: PlatformServices, config: AppConfig, modules: FeatureModule[]): Container {
  const c = new Container({ defaultScope: 'Singleton' });

  // Platform + configuration
  c.bind<AppConfig>(TYPES.Config).toConstantValue(config);
  c.bind<PlatformServices>(TYPES.Platform).toConstantValue(platform);
  c.bind(TYPES.Storage).toConstantValue(platform.storage);
  c.bind(TYPES.SecureStorage).toConstantValue(platform.secureStorage);
  c.bind(TYPES.LifecycleAdapter).toConstantValue(platform.lifecycle);
  c.bind<DynatraceBridge>(TYPES.DynatraceBridge).toConstantValue(
    new ObservableDynatraceBridge(config.dynatrace.enabled ? platform.dynatrace : new NoopDynatraceBridge()),
  );

  // Logging
  c.bind(TYPES.MemoryLogHandler).toConstantValue(new MemoryLogHandler(500));
  c.bind<Logger>(TYPES.Logger)
    .toDynamicValue((ctx) =>
      Logger.create(
        [
          new ConsoleLogHandler(config.environment === 'production' ? 'warn' : undefined),
          get<MemoryLogHandler>(ctx, TYPES.MemoryLogHandler),
          new DynatraceLogHandler(get<DynatraceBridge>(ctx, TYPES.DynatraceBridge), 'warn'),
        ],
        config.logLevel,
        { app: config.appName, version: config.version, platform: platform.kind, env: config.environment },
      ),
    )
    .inSingletonScope();

  // Instrumentation
  c.bind(TYPES.MemoryAnalyticsHandler).toConstantValue(new MemoryAnalyticsHandler());
  c.bind<AnalyticsService>(TYPES.AnalyticsService)
    .toDynamicValue((ctx) => {
      const logger = get<Logger>(ctx, TYPES.Logger);
      return new AnalyticsService(
        [
          get<MemoryAnalyticsHandler>(ctx, TYPES.MemoryAnalyticsHandler),
          new LoggerAnalyticsHandler(logger.child('analytics')),
          new DynatraceAnalyticsHandler(get<DynatraceBridge>(ctx, TYPES.DynatraceBridge)),
        ],
        logger,
      );
    })
    .inSingletonScope();

  // Core services
  c.bind<LifecycleService>(TYPES.LifecycleService)
    .toDynamicValue(
      (ctx) => new LifecycleService(platform.lifecycle, get<Logger>(ctx, TYPES.Logger), get<AnalyticsService>(ctx, TYPES.AnalyticsService)),
    )
    .inSingletonScope();
  c.bind<AuthService>(TYPES.AuthService)
    .toDynamicValue((ctx) => new AuthService(platform.secureStorage, get<Logger>(ctx, TYPES.Logger)))
    .inSingletonScope();
  c.bind<FeatureFlagService>(TYPES.FeatureFlagService)
    .toDynamicValue((ctx) => new FeatureFlagService(get<Logger>(ctx, TYPES.Logger)))
    .inSingletonScope();
  c.bind<ExternalSystemService>(TYPES.ExternalSystemService)
    .toDynamicValue(() => new ExternalSystemService(config, platform))
    .inSingletonScope();
  c.bind<HealthMonitorService>(TYPES.HealthMonitorService)
    .toDynamicValue(
      (ctx) =>
        new HealthMonitorService(
          get<Logger>(ctx, TYPES.Logger),
          get<AnalyticsService>(ctx, TYPES.AnalyticsService),
          get<DynatraceBridge>(ctx, TYPES.DynatraceBridge),
          config,
        ),
    )
    .inSingletonScope();
  c.bind<PreferencesService>(TYPES.PreferencesService)
    .toDynamicValue((ctx) => new PreferencesService(platform.storage, get<Logger>(ctx, TYPES.Logger)))
    .inSingletonScope();

  // Composable modules
  c.bind<ModuleRegistry>(TYPES.ModuleRegistry).toConstantValue(new ModuleRegistry(modules));
  modules.forEach((m) => m.register?.(c));

  return c;
}
