# Feature matrix

Every row from the requirements sheet, where it lives, and how web and mobile share it.
`core` = `packages/core/src`, `web` = `apps/web/src`, `mobile` = `apps/mobile/src`.

| Type | Feature | Platform | Shared logic (core) | Web | Mobile | Demo |
|---|---|---|---|---|---|---|
| Application Framework | Application Lifecycle - Web | Web | `lifecycle/LifecycleService.ts`, `lifecycle/appSlice.ts`, `lifecycle/hooks.ts` | `platform/webLifecycleAdapter.ts` (Page Visibility, online/offline, `error`/`unhandledrejection`, `pagehide`) | – | Observability → Lifecycle |
| Application Framework | Application Lifecycle - Mobile | Mobile | same | – | `platform/nativeLifecycleAdapter.ts` (AppState, NetInfo, `ErrorUtils`) | Observability → Lifecycle |
| Application Framework | Base framework - Web | Web | `bootstrap/createApplication.ts`, `bootstrap/AppProviders.tsx`, `config/appConfig.ts` | `App.tsx`, `main.tsx`, `layout/AppShell.tsx`, `routes/AppRouter.tsx` | – | whole app |
| Application Framework | Base framework - Mobile | Mobile | same | – | `App.tsx`, `navigation/RootNavigator.tsx`, `components/Screen.tsx` | whole app |
| Application Framework | Authentication / Authorization | Shared | `auth/AuthService.ts` (session, token decode, expiry), `auth/permissions.ts` (RBAC matrix), `auth/authSlice.ts`, `store/listeners.ts` (persist / identify / logout) | `routes/AppRouter.tsx` (`RequireAuth`, `RouteGuard`) | `navigation/RootNavigator.tsx` (`RouteGuard`, auth stack) | sign in with the 4 demo roles |
| Feature Functionality | Authentication / Authorization | Shared | `auth/hooks.tsx` (`useAuth`, `useLogin`, `usePermission`, `<Can>`), `validation/forms.ts` (`useLoginForm`) | `pages/LoginPage.tsx` | `screens/LoginScreen.tsx` | Login, Users (write actions), Orders (approve) |
| Feature Functionality | External System Id | Shared | `externalSystem/ExternalSystemService.ts` (registry, validation, deep links, `X-External-System-Id` header), `externalSystem/hooks.ts` | `pages/ExternalSystemsPage.tsx` | `screens/ExternalSystemsScreen.tsx` | External Systems |
| Feature Functionality | Feature flags | Shared | `featureFlags/*` (providers, % rollout, overrides, polling, `useFeatureFlag`, `<Feature>`) | `pages/FeatureFlagsPage.tsx` | `screens/FeatureFlagsScreen.tsx` | Feature Flags; flags gate routes, widgets, fields |
| Application Framework | Themes and Styles - Web | Web | `theme/tokens.ts`, `theme/createTheme.ts`, `theme/themeSlice.ts`, `theme/hooks.ts` | `theme/ThemeStyleSync.tsx` (tokens → CSS variables), `styles/*.css` | – | Settings → Appearance |
| Application Framework | Themes and Styles - Mobile | Mobile | same | – | `theme/styles.ts` (`makeStyles`, `NativeThemeSync`, shadows) | Settings → Appearance |
| Application Framework | Resource Localization | Shared | `i18n/i18n.ts`, `i18n/resources/{en,es,fr}.ts`, `i18n/hooks.ts` (`useLocale`, formatters, `useValidationMessage`) | `react-i18next` in pages | `react-i18next` in screens + `expo-localization` | language switcher (header / login / settings) |
| Architecture pattern | Headless UI | – | `headless/*`: `useSelect`, `useCombobox`, `useMultiSelect`, `useTabs`, `useAccordion`, `useStepper`, `usePagination`, `useTreeView`, `useDataTable`, `useSlider`, `useRating`, `useCalendar`, `useFileUpload`, `useCounter`, `useDisclosure`, `useControllableState` | `components/ui/*` render them | `components/ui/*` render them | Controls gallery |
| Application Framework | UI Component factory - Web | Web | `componentFactory/ComponentRegistry.ts`, `types.ts`, `schemaValidation.ts`, `useSchemaForm.ts`, `sampleSchemas.ts` | `componentFactory/webFieldRegistry.tsx`, `SchemaForm.tsx`, overlay registry `modals/registry.tsx` | – | Dynamic Forms |
| Application Framework | UI Component factory - Mobile | Mobile | same | – | `componentFactory/nativeFieldRegistry.tsx`, `SchemaForm.tsx`, `modals/registry.tsx` | Dynamic Forms |
| Architecture pattern | Composable Architecture - Web | Web | `composable/FeatureModule.ts`, `ModuleRegistry.ts`, `features/*` (modules contribute nav, IoC bindings, lazily injected slices, API endpoints) | `routes/AppRouter.tsx` (route id → lazy page) | – | all routes |
| Architecture pattern | Composable Architecture - Mobile | Mobile | same | – | `navigation/RootNavigator.tsx` (route id → screen) | all screens |
| Feature Functionality | Client-side validation - Web | Web | `validation/schemas.ts` (zod), `validation/useZodForm.ts`, `validation/messages.ts` (i18n-aware messages) | `pages/FormsPage.tsx`, `features/orders/OrderForm.tsx` | – | Forms & Validation, New order |
| Feature Functionality | Client-side validation - Mobile | Mobile | same | – | `screens/FormsScreen.tsx`, `features/orders/OrderForm.tsx` | Forms & Validation, New order |
| Application Framework | Logging framework - base | Shared | `logging/Logger.ts` (levels, child loggers, context provider), `logging/handlers.ts` (console, memory, batching remote) | – | – | Observability → Logs |
| Feature Functionality | Log handler - Dynatrace - Web | Web | `logging/handlers.ts` → `DynatraceLogHandler`, `dynatrace/types.ts` (bridge + outbox) | `platform/dynatraceWebBridge.ts` (RUM JS `dtrum`, `sendBizEvent`) | – | Observability → Dynatrace |
| Feature Functionality | Log handler - Dynatrace - Mobile | Mobile | same | – | `platform/dynatraceNativeBridge.ts` (`@dynatrace/react-native-plugin`) | Observability → Dynatrace |
| Application Framework | Instrumentation/Analytics - Web | Shared | `instrumentation/AnalyticsService.ts`, `instrumentation/middleware.ts` (Redux action + mutation tracking), `instrumentation/hooks.ts` (`useScreenView`, `useTrackEvent`, `usePerformanceTimer`) | `RouteGuard` screen views | `NavigationContainer.onStateChange` screen views | Observability → Analytics |
| Feature Functionality | Instrumentation handler - Dynatrace - Web | Web | `DynatraceAnalyticsHandler` | `DynatraceWebBridge` | – | Observability → Dynatrace |
| Feature Functionality | Instrumentation handler - Dynatrace - Native | Mobile | `DynatraceAnalyticsHandler` | – | `DynatraceNativeBridge` | Observability → Dynatrace |
| Feature Functionality | Health monitoring and alerting - Web and Mobile | Dynatrace | `health/*` (checks, aggregation, history, alert transitions → toast + log + Dynatrace event) | `webHealthChecks` (storage, JS heap) | `nativeHealthChecks` (secure storage) | Observability → Health (chaos controls) |
| Application Framework | Navigation - Web | Web | `navigation/types.ts`, `navigation/hooks.ts` (permission/flag filtered items, sections) | React Router 7 (`routes/AppRouter.tsx`) + `layout/AppShell.tsx` | – | sidebar / top tabs |
| Application Framework | Navigation - Mobile | Mobile | same | – | React Navigation 7: native stack + bottom tabs / drawer | bottom tabs / drawer |
| Feature Functionality | Tabs vs Hamburger menu | Shared | `resolveNavigationLayout`, `splitNavItems`, `useNavigationLayout`, `ui/uiSlice.ts` (`navLayout` preference) | top tabs + "More" dropdown, or sidebar / hamburger drawer | bottom tabs + "More" tab, or drawer | Settings → Navigation |
| Application Framework | Modal and Modeless - Web | Web | `modal/modalSlice.ts`, `modal/hooks.ts` (promise based `open/confirm/alert/drawer/modeless`) | `components/ui/Overlay.tsx` (dialogs, drawers, draggable modeless windows, focus trap) | – | Modals & Windows |
| Application Framework | Modal and Modeless - Mobile | Mobile | same | – | `components/ui/Overlay.tsx` (RN `Modal`, bottom sheets, draggable modeless panel) | Modals & Windows |

## Controls (web + mobile)

Buttons (7 variants, 4 sizes, loading, icon, group), IconButton with badge, TextField (icons, adornments, error, disabled),
TextArea with counter, NumberStepper, Checkbox (indeterminate), RadioGroup (default/card), Switch, Chips (filter), SegmentedControl,
Select (keyboard + type-ahead), Combobox / Autocomplete, MultiSelect / Tag input, DatePicker (shared calendar hook), Slider (marks),
Rating, FileUpload (drag & drop / document picker, validation, progress), Alert, Badge, Tooltip, Toast, Spinner, ProgressBar
(determinate / indeterminate), ProgressRing (web), Skeleton, EmptyState, Card, StatCard, Avatar / AvatarGroup, Timeline,
DescriptionList, Divider, Kbd (web), CodeBlock, BarList, ColumnChart, TreeView, Tabs (line / pill / enclosed), Breadcrumbs,
Pagination, Stepper, Accordion, DropdownMenu (web) / ActionMenu sheet (mobile), DataTable (web) / DataList (mobile),
Dialog, Drawer / BottomSheet, Modeless window.
