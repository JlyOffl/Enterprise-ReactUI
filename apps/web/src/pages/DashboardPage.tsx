import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Can, Feature, FLAGS, useDashboard, useHealthMonitor, useModal } from '@erui/core';
import {
  Alert,
  Badge,
  BarList,
  Button,
  Card,
  ColumnChart,
  Icon,
  Skeleton,
  StatCard,
  Timeline,
  cx,
} from '../components/ui';
import { PageHeader } from '../layout/PageHeader';

export default function DashboardPage() {
  const { t } = useTranslation();
  const d = useDashboard();
  const health = useHealthMonitor();
  const modal = useModal();
  const navigate = useNavigate();

  return (
    <div className="stack gap-xl">
      <PageHeader
        title={t('dashboard.welcome', { name: d.userName })}
        subtitle={t('app.tagline')}
        actions={
          <>
            <Button variant="secondary" leftIcon="refresh" loading={d.isFetching} onClick={() => d.refetch()}>
              {t('common.refresh')}
            </Button>
            <Can permission="orders:write">
              <Button leftIcon="plus" onClick={() => modal.drawer('orders.create', {}, { title: 'orders.newOrder', size: 'lg' })}>
                {t('dashboard.newOrder')}
              </Button>
            </Can>
          </>
        }
      />

      {d.error && <Alert tone="danger" title={t('errors.generic')} action={<Button size="sm" onClick={() => d.refetch()}>{t('common.retry')}</Button>} />}

      <div className="grid grid--4">
        {d.isLoading
          ? Array.from({ length: 4 }, (_, i) => <Skeleton key={i} height={120} radius={14} />)
          : d.kpis.map((k) => (
              <StatCard key={k.id} label={t(k.labelKey)} value={k.value} change={k.changeLabel} trend={k.trend} icon={k.icon} hint={t('dashboard.vsLastPeriod')} />
            ))}
      </div>

      <div className="grid grid--3-1">
        <Feature
          flag={FLAGS.dashboardV2Widgets}
          fallback={
            <Card title={t('dashboard.revenueTrend')}>
              <Alert tone="info">
                Enable the <code>{FLAGS.dashboardV2Widgets}</code> flag to see the revenue trend widget.
              </Alert>
            </Card>
          }
        >
          <Card title={t('dashboard.revenueTrend')} subtitle="Last 6 months">
            {d.isLoading ? <Skeleton height={180} /> : <ColumnChart points={d.series} />}
          </Card>
        </Feature>

        <Card title={t('dashboard.systemHealth')} actions={<Badge tone={health.tone} dot>{t(`health.${health.overall}`)}</Badge>}>
          <ul className="health-list">
            {health.checkList.map((c) => (
              <li key={c.name}>
                <span className={cx('health-dot', c.status === 'healthy' ? 'tone-bg--success' : c.status === 'degraded' ? 'tone-bg--warning' : 'tone-bg--danger')} />
                <span className="health-list__name">{c.name}</span>
                <span className="text-muted text-sm">{c.latencyMs}ms</span>
              </li>
            ))}
          </ul>
          <Button variant="link" size="sm" rightIcon="chevronRight" onClick={() => navigate('/observability')}>
            {t('nav.observability')}
          </Button>
        </Card>
      </div>

      <div className="grid grid--2">
        <Card title={t('dashboard.ordersByStatus')}>
          {d.isLoading ? (
            <Skeleton lines={5} />
          ) : (
            <BarList
              items={d.statusBreakdown.map((s) => ({
                id: s.status,
                label: t(`orders.statuses.${s.status}`),
                value: s.count,
                ratio: s.percent,
                tone: s.tone,
              }))}
            />
          )}
        </Card>
        <Card title={t('dashboard.recentActivity')}>
          {d.isLoading ? (
            <Skeleton lines={5} />
          ) : (
            <Timeline
              items={d.activity.map((a) => ({
                id: a.id,
                title: (
                  <>
                    <strong>{a.actor}</strong> {a.action} <code>{a.target}</code>
                  </>
                ),
                at: a.when,
                tone: a.action === 'approved' ? 'success' : 'primary',
              }))}
            />
          )}
        </Card>
      </div>

      <Card title={t('dashboard.quickActions')}>
        <div className="quick-actions">
          {[
            { icon: 'grid' as const, label: t('nav.controls'), to: '/controls' },
            { icon: 'form' as const, label: t('nav.forms'), to: '/forms' },
            { icon: 'window' as const, label: t('nav.modals'), to: '/modals' },
            { icon: 'settings' as const, label: t('nav.settings'), to: '/settings' },
          ].map((q) => (
            <button key={q.to} type="button" className="quick-action" onClick={() => navigate(q.to)}>
              <span className="quick-action__icon">
                <Icon name={q.icon} size={20} />
              </span>
              {q.label}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
}
