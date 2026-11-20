import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatTime, LOG_LEVELS, useHealthMonitor, useLocale, useObservability, type LogLevel } from '@erui/core';
import {
  Alert,
  Badge,
  Button,
  Card,
  DescriptionList,
  EmptyState,
  SegmentedControl,
  Slider,
  StatCard,
  Tabs,
  cx,
  type Tone,
} from '../components/ui';
import { PageHeader } from '../layout/PageHeader';

const levelTone: Record<LogLevel, Tone> = { debug: 'neutral', info: 'info', warn: 'warning', error: 'danger', fatal: 'danger' };
const statusTone = { healthy: 'success', degraded: 'warning', unhealthy: 'danger', unknown: 'neutral' } as const;

function HealthTab() {
  const { t } = useTranslation();
  const { format } = useLocale();
  const h = useHealthMonitor();
  const o = useObservability();
  const maxLatency = Math.max(100, ...h.history.map((x) => x.latencyMs ?? 0));

  return (
    <div className="stack gap-lg">
      <div className="row wrap gap-sm">
        <Badge tone={h.tone} dot>
          {t(`health.${h.overall}`)}
        </Badge>
        <Button size="sm" leftIcon="refresh" onClick={h.runNow}>
          {t('observability.runChecks')}
        </Button>
        {h.monitoring ? (
          <Button size="sm" variant="secondary" onClick={h.stop}>
            {t('observability.stopMonitoring')}
          </Button>
        ) : (
          <Button size="sm" variant="secondary" onClick={h.start}>
            {t('observability.startMonitoring')}
          </Button>
        )}
        {h.lastRunAt && <span className="text-muted text-sm">{format.relative(h.lastRunAt)}</span>}
      </div>

      <div className="grid grid--3">
        {h.checkList.map((c) => (
          <div key={c.name} className="card check-card">
            <div className="row justify-between">
              <strong>{c.name}</strong>
              <Badge tone={statusTone[c.status]} dot>
                {t(`health.${c.status}`)}
              </Badge>
            </div>
            <div className="text-muted text-sm">{c.message}</div>
            <div className="row justify-between text-sm">
              <span>{c.critical ? 'critical' : 'non-critical'}</span>
              <span>{c.latencyMs} ms</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid--2">
        <Card title="API latency history" subtitle={`${h.history.length} samples`}>
          <div className="sparkbars">
            {h.history.map((s) => (
              <span
                key={s.at}
                title={`${formatTime(s.at)} · ${s.latencyMs ?? 0}ms · ${s.overall}`}
                className={cx('sparkbars__bar', `tone-bg--${statusTone[s.overall]}`)}
                style={{ height: `${Math.max(6, ((s.latencyMs ?? 0) / maxLatency) * 100)}%` }}
              />
            ))}
          </div>
        </Card>
        <Card title="Chaos controls" subtitle={o.mockApi ? 'Mock backend' : 'Real backend: controls disabled'}>
          <div className="stack gap-md">
            <Slider
              label={t('observability.failureRate')}
              min={0}
              max={1}
              step={0.05}
              value={o.chaos.failureRate}
              onChange={o.setFailureRate}
              formatValue={(v) => `${Math.round(v * 100)}%`}
              disabled={!o.mockApi}
            />
            <div className="field">
              <span className="field__label">{t('observability.healthMode')}</span>
              <SegmentedControl
                value={o.chaos.healthMode}
                onChange={(m) => {
                  o.setHealthMode(m);
                  void h.runNow();
                }}
                options={[
                  { value: 'normal', label: 'Normal' },
                  { value: 'degraded', label: 'Degraded' },
                  { value: 'down', label: 'Down' },
                ]}
              />
            </div>
          </div>
        </Card>
      </div>

      <Card title={t('observability.alerts')} actions={h.alerts.length > 0 && <Button size="xs" variant="ghost" onClick={h.clearAlerts}>{t('common.clear')}</Button>}>
        {h.alerts.length === 0 ? (
          <EmptyState icon="bell" title={t('observability.noAlerts')} />
        ) : (
          <div className="stack gap-sm">
            {h.alerts.map((a) => (
              <Alert
                key={a.id}
                tone={a.severity === 'critical' ? 'danger' : a.severity === 'warning' ? 'warning' : 'success'}
                title={`${a.title} · ${format.relative(a.raisedAt)}`}
                action={!a.acknowledged && <Button size="xs" variant="ghost" onClick={() => h.acknowledge(a.id)}>{t('observability.acknowledge')}</Button>}
              >
                {a.message} {a.acknowledged && <Badge>ack</Badge>}
              </Alert>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function LogsTab() {
  const { t } = useTranslation();
  const o = useObservability();
  const [message, setMessage] = useState('Hello from the log console');
  const levels = Object.keys(LOG_LEVELS) as LogLevel[];
  return (
    <div className="stack gap-md">
      <div className="row wrap gap-sm">
        <SegmentedControl size="sm" value={o.levelFilter} onChange={o.setLevelFilter} options={[{ value: 'all', label: 'All' }, ...levels.map((l) => ({ value: l, label: l }))]} />
        <span className="text-muted text-sm">Min level:</span>
        <SegmentedControl size="sm" value={o.minLevel} onChange={o.setMinLevel} options={levels.map((l) => ({ value: l, label: l }))} />
      </div>
      <div className="row wrap gap-sm">
        <input className="input input--sm grow plain-input" value={message} onChange={(e) => setMessage(e.target.value)} />
        {levels.map((l) => (
          <Button key={l} size="sm" variant={l === 'error' || l === 'fatal' ? 'danger' : 'secondary'} onClick={() => o.emitLog(l, message)}>
            {l}
          </Button>
        ))}
        <Button size="sm" variant="outline" onClick={o.throwHandledError}>
          {t('observability.simulateError')}
        </Button>
        <Button size="sm" variant="ghost" onClick={o.clearLogs}>
          {t('common.clear')}
        </Button>
      </div>
      <div className="log-view">
        {o.logs.map((l) => (
          <div key={l.id} className="log-view__row">
            <span className="text-muted">{formatTime(l.timestamp)}</span>
            <Badge tone={levelTone[l.level]}>{l.level}</Badge>
            <span className="log-view__logger">{l.logger}</span>
            <span className="log-view__msg">
              {l.message}
              {l.data && <span className="text-muted"> {JSON.stringify(l.data)}</span>}
              {l.error && <span className="text-danger"> {l.error.name}: {l.error.message}</span>}
            </span>
          </div>
        ))}
        {o.logs.length === 0 && <EmptyState icon="file" title="No log entries" />}
      </div>
    </div>
  );
}

function AnalyticsTab() {
  const o = useObservability();
  return (
    <div className="stack gap-md">
      <div className="row gap-sm">
        <Button size="sm" onClick={o.trackTestEvent}>
          Track test event
        </Button>
        <Button size="sm" variant="ghost" onClick={o.clearEvents}>
          Clear
        </Button>
      </div>
      <div className="log-view">
        {o.events.map((e) => (
          <div key={e.id} className="log-view__row">
            <span className="text-muted">{formatTime(e.timestamp)}</span>
            <Badge tone={e.type === 'screen' ? 'primary' : e.type === 'timing' ? 'info' : e.type === 'identify' ? 'success' : 'neutral'}>{e.type}</Badge>
            <span className="log-view__logger">{e.name}</span>
            <span className="log-view__msg text-muted">
              {e.durationMs !== undefined && `${e.durationMs}ms `}
              {JSON.stringify(e.properties)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DynatraceTab() {
  const { t } = useTranslation();
  const o = useObservability();
  return (
    <div className="stack gap-md">
      {o.dynatraceAvailable ? (
        <Alert tone="success">{t('observability.dynatraceEnabled')}</Alert>
      ) : (
        <Alert tone="info" title="Dry run">
          {t('observability.dynatraceDisabled')} Set <code>VITE_DYNATRACE_ENABLED=true</code> and <code>VITE_DYNATRACE_SCRIPT_URL</code> to ship to Dynatrace.
        </Alert>
      )}
      <div className="row gap-sm">
        <Button size="sm" variant="ghost" onClick={o.clearDynatrace}>
          Clear
        </Button>
      </div>
      <div className="log-view">
        {o.dynatraceCalls.map((c) => (
          <div key={c.id} className="log-view__row">
            <span className="text-muted">{formatTime(c.at)}</span>
            <Badge tone={c.method === 'reportError' ? 'danger' : c.method === 'reportEvent' ? 'primary' : 'neutral'}>{c.method}</Badge>
            <span className="log-view__logger">{c.name}</span>
            <span className="log-view__msg text-muted">{c.payload ? JSON.stringify(c.payload) : ''}</span>
            <Badge tone={c.delivered ? 'success' : 'neutral'} variant="outline">
              {c.delivered ? 'sent' : 'dry-run'}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}

function LifecycleTab() {
  const { t } = useTranslation();
  const { format } = useLocale();
  const { lifecycle } = useObservability();
  const total = lifecycle.startupTimings.reduce((s, x) => s + x.durationMs, 0);
  return (
    <div className="stack gap-lg">
      <div className="grid grid--4">
        <StatCard label={t('observability.phase')} value={lifecycle.phase} icon="zap" />
        <StatCard label="Visibility" value={lifecycle.visibility} icon="eye" />
        <StatCard label="Network" value={lifecycle.online ? t('common.online') : t('common.offline')} icon="globe" />
        <StatCard label={t('observability.backgroundCount')} value={lifecycle.backgroundCount} icon="clock" />
      </div>
      <Card title={t('observability.startupTasks')} subtitle={`${total} ms total`}>
        <div className="stack gap-sm">
          {lifecycle.startupTimings.map((s) => (
            <div key={s.name} className="row gap-sm">
              <Badge tone={s.ok ? 'success' : 'danger'} dot>
                {s.ok ? 'ok' : 'failed'}
              </Badge>
              <code className="grow">{s.name}</code>
              <span className="text-muted text-sm">{s.durationMs} ms</span>
            </div>
          ))}
        </div>
      </Card>
      <Card title="Timestamps">
        <DescriptionList
          items={[
            { label: 'Started', value: lifecycle.startedAt ? format.dateTime(lifecycle.startedAt) : '—' },
            { label: 'Ready', value: lifecycle.readyAt ? format.dateTime(lifecycle.readyAt) : '—' },
            { label: 'Last foreground', value: lifecycle.lastForegroundAt ? format.relative(lifecycle.lastForegroundAt) : '—' },
            { label: 'Boot error', value: lifecycle.bootError ?? '—' },
          ]}
        />
        <p className="text-muted text-sm mt-sm">Switch to another browser tab and back to see visibility changes; toggle offline in DevTools to see connectivity.</p>
      </Card>
    </div>
  );
}

const TABS = { health: HealthTab, logs: LogsTab, analytics: AnalyticsTab, dynatrace: DynatraceTab, lifecycle: LifecycleTab };
type TabId = keyof typeof TABS;

export default function ObservabilityPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<TabId>('health');
  const Active = TABS[tab];
  return (
    <div className="stack gap-lg">
      <PageHeader title={t('observability.title')} subtitle={t('observability.subtitle')} />
      <Tabs
        value={tab}
        onChange={(v) => setTab(v as TabId)}
        items={[
          { id: 'health', label: t('observability.health'), icon: 'activity' },
          { id: 'logs', label: t('observability.logs'), icon: 'file' },
          { id: 'analytics', label: t('observability.analytics'), icon: 'trendUp' },
          { id: 'dynatrace', label: t('observability.dynatrace'), icon: 'send' },
          { id: 'lifecycle', label: t('observability.lifecycle'), icon: 'zap' },
        ]}
      />
      <Active />
    </div>
  );
}
