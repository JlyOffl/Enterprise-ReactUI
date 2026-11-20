import { lazy, Suspense, useMemo, type ComponentType, type LazyExoticComponent } from 'react';
import { createBrowserRouter, Navigate, RouterProvider, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  useAllNavItems,
  useAppLifecycle,
  useAuth,
  useFeatureFlag,
  usePermission,
  useScreenView,
  type NavItem,
} from '@erui/core';
import { AppShell } from '../layout/AppShell';
import { Alert, Button, Icon, Skeleton, Spinner } from '../components/ui';
import LoginPage from '../pages/LoginPage';
import { AccessDenied, NotFoundPage } from '../pages/StatusPages';

/** Composable architecture - Web: route id (from shared modules) -> lazily loaded page. */
const PAGES: Record<string, LazyExoticComponent<ComponentType>> = {
  dashboard: lazy(() => import('../pages/DashboardPage')),
  controls: lazy(() => import('../pages/ControlsPage')),
  forms: lazy(() => import('../pages/FormsPage')),
  dynamicForms: lazy(() => import('../pages/DynamicFormsPage')),
  users: lazy(() => import('../pages/UsersPage')),
  orders: lazy(() => import('../pages/OrdersPage')),
  modals: lazy(() => import('../pages/ModalsPage')),
  featureFlags: lazy(() => import('../pages/FeatureFlagsPage')),
  observability: lazy(() => import('../pages/ObservabilityPage')),
  externalSystems: lazy(() => import('../pages/ExternalSystemsPage')),
  settings: lazy(() => import('../pages/SettingsPage')),
};

function PageSkeleton() {
  return (
    <div className="stack gap-lg">
      <Skeleton height={28} width={260} />
      <Skeleton height={14} width={420} />
      <div className="grid grid--4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} height={110} radius={14} />
        ))}
      </div>
      <Skeleton height={280} radius={14} />
    </div>
  );
}

/** Authorization + feature flag guard per route, with screen-view instrumentation. */
function RouteGuard({ item }: { item: NavItem }) {
  const allowed = usePermission(item.permission);
  const flagOn = useFeatureFlag(item.featureFlag ?? '');
  useScreenView(item.id);
  if (item.featureFlag && !flagOn) return <NotFoundPage />;
  if (!allowed) return <AccessDenied />;
  const Page = PAGES[item.id];
  if (!Page) return <NotFoundPage />;
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Page />
    </Suspense>
  );
}

export function BootScreen() {
  const { t } = useTranslation();
  return (
    <div className="boot">
      <span className="brand__logo brand__logo--lg">
        <Icon name="layers" size={24} />
      </span>
      <Spinner size={28} />
      <span className="text-muted">{t('common.loading')}</span>
    </div>
  );
}

function BootError({ message }: { message: string }) {
  return (
    <div className="boot">
      <Alert tone="danger" title="Application failed to start" action={<Button onClick={() => window.location.reload()}>Reload</Button>}>
        {message}
      </Alert>
    </div>
  );
}

function RequireAuth() {
  const auth = useAuth();
  const lifecycle = useAppLifecycle();
  const location = useLocation();
  if (lifecycle.phase === 'error') return <BootError message={lifecycle.bootError ?? 'Unknown error'} />;
  if (auth.isRestoring) return <BootScreen />;
  if (!auth.isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <AppShell />;
}

function LoginRoute() {
  const auth = useAuth();
  const location = useLocation();
  if (auth.isRestoring) return <BootScreen />;
  if (auth.isAuthenticated) {
    const from = (location.state as { from?: string } | null)?.from ?? '/';
    return <Navigate to={from} replace />;
  }
  return <LoginPage />;
}

/** Navigation - Web: React Router routes generated from the shared navigation model. */
export function AppRouter() {
  const items = useAllNavItems();
  const router = useMemo(
    () =>
      createBrowserRouter([
        { path: '/login', element: <LoginRoute /> },
        {
          element: <RequireAuth />,
          children: [
            ...items.map((item) =>
              item.path === '/'
                ? { index: true, element: <RouteGuard item={item} /> }
                : { path: item.path, element: <RouteGuard item={item} /> },
            ),
            { path: '*', element: <NotFoundPage /> },
          ],
        },
      ]),
    [items],
  );
  return <RouterProvider router={router} />;
}
