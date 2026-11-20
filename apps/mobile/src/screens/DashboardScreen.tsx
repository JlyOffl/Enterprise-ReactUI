import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Can, Feature, FLAGS, useDashboard, useHealthMonitor, useModal, useTheme } from '@erui/core';
import { Alert, Badge, BarList, Button, Card, ColumnChart, Skeleton, StatCard, Text, Timeline, toneColors } from '../components/ui';
import { Screen } from '../components/Screen';
import { useAppNavigate } from '../navigation/useAppNavigate';

export default function DashboardScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const d = useDashboard();
  const health = useHealthMonitor();
  const modal = useModal();
  const go = useAppNavigate();

  return (
    <Screen title={t('dashboard.welcome', { name: d.userName })} subtitle={t('app.tagline')} onRefresh={d.refetch} refreshing={d.isFetching && !d.isLoading}>
      {d.error && <Alert tone="danger" title={t('errors.generic')} action={<Button size="sm" onPress={d.refetch}>{t('common.retry')}</Button>} />}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {d.isLoading
          ? Array.from({ length: 4 }, (_, i) => <View key={i} style={{ flexBasis: '47%', flexGrow: 1 }}><Skeleton height={110} radius={14} /></View>)
          : d.kpis.map((k) => (
              <View key={k.id} style={{ flexBasis: '47%', flexGrow: 1 }}>
                <StatCard label={t(k.labelKey)} value={k.value} change={k.changeLabel} trend={k.trend} icon={k.icon} />
              </View>
            ))}
      </View>

      <Can permission="orders:write">
        <Button leftIcon="plus" onPress={() => modal.drawer('orders.create', {}, { title: 'orders.newOrder', size: 'lg' })}>{t('dashboard.newOrder')}</Button>
      </Can>

      <Feature flag={FLAGS.dashboardV2Widgets} fallback={<Alert tone="info">{`Enable "${FLAGS.dashboardV2Widgets}" to see the revenue trend.`}</Alert>}>
        <Card title={t('dashboard.revenueTrend')} subtitle="Last 6 months">
          {d.isLoading ? <Skeleton height={160} /> : <ColumnChart points={d.series} />}
        </Card>
      </Feature>

      <Card title={t('dashboard.systemHealth')} actions={<Badge tone={health.tone} dot>{t(`health.${health.overall}`)}</Badge>} onPress={() => go('observability')}>
        <View style={{ gap: 10 }}>
          {health.checkList.map((c) => (
            <View key={c.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: toneColors(theme, c.status === 'healthy' ? 'success' : c.status === 'degraded' ? 'warning' : 'danger').fg }} />
              <Text style={{ flex: 1 }}>{c.name}</Text>
              <Text variant="caption" tone="muted">{c.latencyMs}ms</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card title={t('dashboard.ordersByStatus')}>
        {d.isLoading ? <Skeleton lines={4} /> : <BarList items={d.statusBreakdown.map((s) => ({ id: s.status, label: t(`orders.statuses.${s.status}`), value: s.count, ratio: s.percent, tone: s.tone }))} />}
      </Card>

      <Card title={t('dashboard.recentActivity')}>
        {d.isLoading ? (
          <Skeleton lines={4} />
        ) : (
          <Timeline items={d.activity.map((a) => ({ id: a.id, title: `${a.actor} ${a.action} ${a.target}`, at: a.when, tone: a.action === 'approved' ? 'success' : 'primary' }))} />
        )}
      </Card>
    </Screen>
  );
}
