/**
 * @erui/core — everything except rendering.
 * UI projects (apps/web, apps/mobile) import from here and only provide components,
 * platform adapters and route/screen mappings.
 */

// Bootstrap / application framework
export * from './bootstrap/createApplication';
export * from './bootstrap/AppProviders';
export * from './config/appConfig';
export * from './platform/types';

// Inversion of control
export * from './di/tokens';
export * from './di/container';
export * from './di/DIProvider';

// State + API
export * from './store/rootReducer';
export * from './store/store';
export * from './store/hooks';
export * from './store/actions';
export * from './api/baseApi';
export * from './api/baseQuery';
export { mockControl } from './api/mock/mockServer';
export { DEMO_ACCOUNTS } from './api/mock/data';

// Application lifecycle
export * from './lifecycle/types';
export * from './lifecycle/appSlice';
export * from './lifecycle/LifecycleService';
export * from './lifecycle/hooks';

// Authentication / authorization
export * from './auth/permissions';
export * from './auth/authSlice';
export * from './auth/AuthService';
export * from './auth/authApi';
export * from './auth/hooks';

// External system id
export * from './externalSystem/ExternalSystemService';
export * from './externalSystem/hooks';

// Feature flags
export * from './featureFlags/definitions';
export * from './featureFlags/featureFlagsSlice';
export * from './featureFlags/FeatureFlagService';
export * from './featureFlags/hooks';

// Themes & styles
export * from './theme/tokens';
export * from './theme/createTheme';
export * from './theme/themeSlice';
export * from './theme/hooks';

// Localization
export * from './i18n/i18n';
export * from './i18n/hooks';

// Headless UI
export * from './headless/state';
export * from './headless/collections';
export * from './headless/selection';
export * from './headless/useDataTable';
export * from './headless/inputs';

// UI component factory
export * from './componentFactory/types';
export * from './componentFactory/ComponentRegistry';
export * from './componentFactory/schemaValidation';
export * from './componentFactory/useSchemaForm';
export * from './componentFactory/sampleSchemas';

// Composable architecture
export * from './composable/FeatureModule';
export * from './composable/ModuleRegistry';

// Client-side validation
export * from './validation/messages';
export * from './validation/schemas';
export * from './validation/useZodForm';
export * from './validation/forms';

// Logging / Dynatrace / instrumentation / health
export * from './logging/types';
export * from './logging/Logger';
export * from './logging/handlers';
export * from './dynatrace/types';
export * from './instrumentation/AnalyticsService';
export * from './instrumentation/middleware';
export * from './instrumentation/hooks';
export * from './health/types';
export * from './health/healthSlice';
export * from './health/HealthMonitorService';
export * from './health/healthApi';
export * from './health/hooks';

// Navigation (tabs vs hamburger), UI state, modals, toasts, preferences
export * from './navigation/types';
export * from './navigation/hooks';
export * from './ui/uiSlice';
export * from './ui/hooks';
export * from './modal/modalSlice';
export * from './modal/hooks';
export * from './notifications/toastSlice';
export * from './notifications/hooks';
export * from './preferences/PreferencesService';

// Feature modules (business logic + view-models)
export * from './features';

// Utilities
export * from './utils/id';
export * from './utils/format';
export * from './utils/errors';
export * from './utils/observableBuffer';
