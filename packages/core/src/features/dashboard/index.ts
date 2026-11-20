import { useMemo } from 'react';
import { baseApi } from '../../api/baseApi';
import { defineModule } from '../../composable/FeatureModule';
import { useAppSelector } from '../../store/hooks';
import { selectUser } from '../../auth/authSlice';
import { selectOverallHealth } from '../../health/healthSlice';
import { useFeatureFlag } from '../../featureFlags/hooks';
import { FLAGS } from '../../featureFlags/definitions';
import { useLocale } from '../../i18n/hooks';
import type { IconName } from '../../navigation/types';
import type { DashboardStats, OrderStatus } from '../models';

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getDashboardStats: build.query<DashboardStats, void>({
      query: () => '/dashboard/stats',
      providesTags: ['Dashboard'],
    }),
  }),
});

export const dashboardModule = defineModule({
  id: 'dashboard',
  navItems: [
    { id: 'dashboard', path: '/', labelKey: 'nav.dashboard', icon: 'home', section: 'main', order: 10, primary: true, permission: 'dashboard:read' },
  ],
});

export interface KpiCard {
  id: string;
  labelKey: string;
  value: string;
  change: number;
  changeLabel: string;
  trend: 'up' | 'down';
  icon: IconName;
}

export const ORDER_STATUS_TONE: Record<OrderStatus, 'neutral' | 'info' | 'primary' | 'warning' | 'success' | 'danger'> = {
  draft: 'neutral',
  pending: 'warning',
  approved: 'primary',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
};

/** Dashboard view-model: KPI cards, chart series, status breakdown, activity. */
export function useDashboard() {
  const query = dashboardApi.useGetDashboardStatsQuery(undefined, { pollingInterval: 60_000 });
  const user = useAppSelector(selectUser);
  const health = useAppSelector(selectOverallHealth);
  const showV2 = useFeatureFlag(FLAGS.dashboardV2Widgets);
  const { format } = useLocale();
  const stats = query.data;

  const kpis = useMemo<KpiCard[]>(() => {
    if (!stats) return [];
    const card = (id: string, labelKey: string, value: string, change: number, icon: IconName): KpiCard => ({
      id,
      labelKey,
      value,
      change,
      changeLabel: `${change >= 0 ? '+' : ''}${format.percent(change)}`,
      trend: change >= 0 ? 'up' : 'down',
      icon,
    });
    return [
      card('revenue', 'dashboard.revenue', format.currency(stats.revenue), stats.revenueChange, 'activity'),
      card('orders', 'dashboard.orders', format.number(stats.orders), stats.ordersChange, 'cart'),
      card('users', 'dashboard.activeUsers', format.number(stats.activeUsers), stats.usersChange, 'users'),
      card('conversion', 'dashboard.conversion', format.percent(stats.conversionRate), stats.conversionChange, 'layers'),
    ];
  }, [stats, format]);

  const statusBreakdown = useMemo(() => {
    if (!stats) return [];
    const total = (Object.values(stats.ordersByStatus) as number[]).reduce((a, b) => a + b, 0) || 1;
    return (Object.entries(stats.ordersByStatus) as Array<[OrderStatus, number]>)
      .filter(([, count]) => count > 0)
      .map(([status, count]) => ({ status, count, percent: count / total, tone: ORDER_STATUS_TONE[status] }));
  }, [stats]);

  const maxSeries = Math.max(1, ...(stats?.revenueSeries.map((p) => p.value) ?? [1]));

  return {
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    error: query.error,
    refetch: query.refetch,
    userName: user?.name.split(' ')[0] ?? '',
    kpis,
    series: stats?.revenueSeries.map((p) => ({ ...p, ratio: p.value / maxSeries, formatted: format.currency(p.value) })) ?? [],
    statusBreakdown,
    activity: stats?.recentActivity.map((a) => ({ ...a, when: format.relative(a.at) })) ?? [],
    health,
    showV2,
  };
}
