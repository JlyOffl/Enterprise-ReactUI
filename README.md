# Enterprise ReactUI

Enterprise reference application for **React (web)** and **React Native (mobile)**. Both UIs sit on a single
shared core. Only rendering and a few platform adapters differ between the two apps. Business rules, state, API calls,
validation, localization, theming tokens, headless control logic and cross-cutting services are written once.

```
enterprise-reactui/
├─ packages/
│  └─ core/                @erui/core: everything except rendering (TypeScript source, no build step)
├─ apps/
│  ├─ web/                 React 19 + Vite + React Router 7 + lucide icons
│  └─ mobile/              Expo SDK 54 + React Native + React Navigation 7
└─ docs/FEATURES.md        requirement → file mapping
```

## Stack (well maintained, long-term-support libraries)

| Concern | Library |
|---|---|
| State + API calls | Redux Toolkit 2 (`createSlice`, `combineSlices`, listener middleware) + **RTK Query** |
| Inversion of control | **InversifyJS** (composition root in `core/src/di/container.ts`, `useService()` hook) |
| Forms / validation | React Hook Form + Zod (`@hookform/resolvers`) |
| Localization | i18next + react-i18next (en / es / fr), `Intl` formatters |
| Web | React 19, Vite 6, React Router 7, lucide-react |
| Mobile | Expo SDK 54, React Native 0.81, React Navigation 7 (stack, bottom tabs, drawer), Expo SecureStore, AsyncStorage, NetInfo |
| Observability | Logger + Dynatrace bridges (RUM JavaScript on web, `@dynatrace/react-native-plugin` on mobile) |

## Architecture

```
            ┌──────────────── apps/web ────────────────┐   ┌────────────── apps/mobile ───────────────┐
 rendering  │ components/ui (DOM)  pages  AppShell     │   │ components/ui (RN)  screens  Navigator   │
 adapters   │ webPlatform: storage, lifecycle, dtrum   │   │ nativePlatform: SecureStore, AppState,…  │
            └──────────────────────┬───────────────────┘   └──────────────────┬───────────────────────┘
                                   │  createApplication({ platform, config, modules })
            ┌──────────────────────▼──────────────────── packages/core ───────▼───────────────────────┐
            │ IoC container (Inversify) ─ Logger · Analytics · Lifecycle · Auth · FeatureFlags ·        │
            │                             ExternalSystems · HealthMonitor · Preferences · module services│
            │ Redux store ─ auth · app · ui · theme · featureFlags · health · modal · toast · api(RTKQ) │
            │               + lazily injected module slices (e.g. orderDraft)                           │
            │ Feature modules ─ nav items, IoC bindings, endpoints, view-model hooks                    │
            │ Headless UI hooks ─ select, combobox, table, calendar, tree, stepper, slider, …           │
            │ Component factory ─ JSON form schemas + ComponentRegistry contract                        │
            └──────────────────────────────────────────────────────────────────────────────────────────┘
```

* **Platform contract**: `PlatformServices` (`core/src/platform/types.ts`). Each app supplies storage, secure storage,
  a lifecycle adapter, a Dynatrace bridge, device info/locale and extra health checks.
* **View-model hooks**: pages and screens stay thin. `useDashboard`, `useUsersDirectory`, `useOrdersList`,
  `useOrderForm`, `useLoginForm`, `useRegistrationForm`, `useSchemaForm`, `useFeatureFlagAdmin`,
  `useObservability`, `useExternalSystemsWorkbench` and `useSettings` hold all of the logic and are used unchanged by both UIs.
* **API layer**: `enterpriseBaseQuery` adds the bearer token, the `X-External-System-Id`, `X-Correlation-Id` and
  `Accept-Language` headers, a Dynatrace action per request, structured logs, retry with backoff for 5xx and network
  errors, and central 401 handling for session expiry. An **in-process mock backend** (`api/mock`) lets you run
  everything with zero infrastructure. Set `useMockApi=false` to call a real API that uses the same contracts.
* **Composable modules**: `features/*` export `FeatureModule`s (dashboard, users, orders, showcase,
  external systems, platform admin). The apps map each `navItem.id` to a page or screen. Add or remove modules in
  `createApplication({ modules })`.

## Getting started

Requires Node ≥ 22.13 (Expo SDK 58).

```bash
npm install          # installs all workspaces
npm run web          # http://localhost:5173
npm run mobile       # Expo dev server (press i / a, or scan with Expo Go)
```

The first time you run the mobile app, align native module versions with your installed Expo SDK:

```bash
cd apps/mobile && npx expo install --fix
```

### Demo accounts (mock backend)

| Email | Password | Role | Notable access |
|---|---|---|---|
| admin@contoso.com | Admin@123 | admin | everything, including feature flags |
| manager@contoso.com | Manager@123 | manager | approve orders, observability, integrations |
| agent@contoso.com | Agent@123 | agent | create orders, read users |
| viewer@contoso.com | Viewer@123 | viewer | dashboard + orders (read only); fewer destinations, so the web app switches to top tabs automatically |

### Configuration

* Web: `apps/web/.env.example` (`VITE_*`)
* Mobile: `apps/mobile/.env.example` (`EXPO_PUBLIC_*`)

**Dynatrace**
* Web: set `VITE_DYNATRACE_ENABLED=true` and `VITE_DYNATRACE_SCRIPT_URL` to your RUM JavaScript tag.
* Mobile: copy `dynatrace.config.example.js` to `dynatrace.config.js`, add `"@dynatrace/react-native-plugin"` to
  `app.json` plugins, run `npx expo prebuild`, then set `EXPO_PUBLIC_DYNATRACE_ENABLED=true`. This needs a development
  build; Expo Go cannot load the agent.
* When Dynatrace is disabled, the **Dynatrace outbox** (Observability page) shows a dry run of every call that would be sent.

## Things to try

1. Sign in as **admin**. Open **Observability → Health**, set *Backend health* to *Down*, and watch the alert toast,
   the history bars and the Dynatrace outbox. Raise the *API failure rate* and browse Users to see retries in the logs.
2. **Feature Flags**: turn on `experimental.aiAssist`. The extra field appears in *Dynamic Forms → Customer onboarding*.
   Turn off `module.orders` and the Orders route and menu entry disappear.
3. **Settings → Navigation**: switch between Tabs and Hamburger, and resize the browser. On mobile the app switches
   between bottom tabs and a drawer.
4. **Modals & Windows**: open several modeless inspectors, drag them around and minimize them, and stack dialogs.
5. Change the language to Español or Français. Validation messages come from the shared zod schemas and are translated too.

## Adding a feature module

```ts
// packages/core/src/features/invoices/index.ts
export const invoicesApi = baseApi.injectEndpoints({ endpoints: (b) => ({ getInvoices: b.query<Invoice[], void>({ query: () => '/invoices' }) }) });
export const invoicesModule = defineModule({
  id: 'invoices',
  featureFlag: 'module.invoices',
  navItems: [{ id: 'invoices', path: '/invoices', labelKey: 'nav.invoices', icon: 'file', section: 'main', order: 45, permission: 'orders:read' }],
  register: (c) => c.bind(INVOICE_SERVICE).toConstantValue(new InvoiceService()),
});
export function useInvoices() { /* view-model shared by web + mobile */ }
```

Then add `invoicesModule` to `coreModules`, and map `invoices` to a page in `apps/web/src/routes/AppRouter.tsx` and to a
screen in `apps/mobile/src/navigation/RootNavigator.tsx`.

## Notes

* No tests yet, by request. The headless hooks, services and `resolveNavigationLayout` are pure and easy to unit test
  when tests are added.
* Spanish and French translate the shell, auth, validation, dashboard and settings. Other strings fall back to English.
