/** Inversion-of-control service identifiers. */
export const TYPES = {
  Config: Symbol.for('erui.Config'),
  Platform: Symbol.for('erui.Platform'),
  Storage: Symbol.for('erui.Storage'),
  SecureStorage: Symbol.for('erui.SecureStorage'),
  LifecycleAdapter: Symbol.for('erui.LifecycleAdapter'),
  DynatraceBridge: Symbol.for('erui.DynatraceBridge'),
  Logger: Symbol.for('erui.Logger'),
  MemoryLogHandler: Symbol.for('erui.MemoryLogHandler'),
  AnalyticsService: Symbol.for('erui.AnalyticsService'),
  MemoryAnalyticsHandler: Symbol.for('erui.MemoryAnalyticsHandler'),
  LifecycleService: Symbol.for('erui.LifecycleService'),
  AuthService: Symbol.for('erui.AuthService'),
  FeatureFlagService: Symbol.for('erui.FeatureFlagService'),
  ExternalSystemService: Symbol.for('erui.ExternalSystemService'),
  HealthMonitorService: Symbol.for('erui.HealthMonitorService'),
  PreferencesService: Symbol.for('erui.PreferencesService'),
  ModuleRegistry: Symbol.for('erui.ModuleRegistry'),
  I18n: Symbol.for('erui.I18n'),
  OrderPricingService: Symbol.for('erui.OrderPricingService'),
} as const;

export type ServiceIdentifier = (typeof TYPES)[keyof typeof TYPES] | symbol;
