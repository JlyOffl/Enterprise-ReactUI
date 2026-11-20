import { useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { formatTime, LOG_LEVELS, useHealthMonitor, useLocale, useObservability, useTheme, type LogLevel } from '@erui/core';
import { Alert, Badge, Button, Card, DescriptionList, EmptyState, SegmentedControl, Slider, Tabs, Text, toneColors, type Tone } from '../components/ui';
import { Row, Screen } from '../components/Screen';

const levelTone: Record<LogLevel, Tone> = { debug: 'neutral', info: 'info', warn: 'warning', error: 'danger', fatal: 'danger' };
const statusTone = { healthy: 'success', degraded: 'warning', unhealthy: 'danger', unknown: 'neutral' } as const;

function LogRow({ time, badge, tone, name, detail }: { time: string; badge: string; tone: Tone; name: string; detail?: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border, gap: 4 }}>
      <Row gap={6}>
        <Text variant="caption" tone="muted">{formatTime(time)}</Text>
        <Badge tone={tone}>{badge}</Badge>
        <Text variant="caption" tone="primary" numberOfLines={1} style={{ flex: 1 }}>{name}</Text>
      </Row>
      {detail ? <Text variant="mono" style={{ color: colors.textMuted }} numberOfLines={3}>{detail}</Text> : null}
    </View>
  );
}

export default function ObservabilityScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { format } = useLocale();
  const h = useHealthMonitor();
  const o = useObservability();
  const [tab, setTab] = useState('health');
  const levels = Object.keys(LOG_LEVELS) as LogLevel[];

  return (
    <Screen title={t('observability.title')} subtitle={t('observability.subtitle')}>
      <Tabs
        value={tab}
        onChange={setTab}
        items={[
          { id: 'health', label: t('observability.health'), icon: 'activity' },
          { id: 'logs', label: t('observability.logs'), icon: 'file' },
          { id: 'analytics', label: t('observability.analytics'), icon: 'trendUp' },
          { id: 'dynatrace', label: 'Dynatrace', icon: 'send' },
          { id: 'lifecycle', label: t('observability.lifecycle'), icon: 'zap' },
        ]}
      />

      {tab === 'health' && (
        <>
          <Row wrap>
            <Badge tone={h.tone} dot>{t(`health.${h.overall}`)}</Badge>
            <Button size="sm" leftIcon="refresh" onPress={h.runNow}>{t('observability.runChecks')}</Button>
            <Button size="sm" variant="secondary" onPress={h.monitoring ? h.stop : h.start}>{h.monitoring ? t('observability.stopMonitoring') : t('observability.startMonitoring')}</Button>
          </Row>
          {h.checkList.map((c) => (
            <Card key={c.name}>
              <Row>
                <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: toneColors(theme, statusTone[c.status]).fg }} />
                <Text weight="600" style={{ flex: 1 }}>{c.name}</Text>
                <Text variant="caption" tone="muted">{c.latencyMs} ms</Text>
              </Row>
              <Text variant="caption" tone="muted">{c.message}</Text>
            </Card>
          ))}
          <Card title="API latency history">
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 90 }}>
              {h.history.map((s) => (
                <View key={s.at} style={{ flex: 1, height: `${Math.max(6, Math.min(100, ((s.latencyMs ?? 0) / 800) * 100))}%`, backgroundColor: toneColors(theme, statusTone[s.overall]).fg, borderRadius: 2 }} />
              ))}
            </View>
          </Card>
          <Card title="Chaos controls">
            <View style={{ gap: 12 }}>
              <Slider label={t('observability.failureRate')} min={0} max={1} step={0.05} value={o.chaos.failureRate} onChange={o.setFailureRate} formatValue={(v) => `${Math.round(v * 100)}%`} disabled={!o.mockApi} />
              <SegmentedControl value={o.chaos.healthMode} onChange={(m) => (o.setHealthMode(m), void h.runNow())} options={[{ value: 'normal', label: 'Normal' }, { value: 'degraded', label: 'Degraded' }, { value: 'down', label: 'Down' }]} />
            </View>
          </Card>
          <Card title={t('observability.alerts')}>
            {h.alerts.length === 0 ? (
              <EmptyState icon="bell" title={t('observability.noAlerts')} />
            ) : (
              <View style={{ gap: 8 }}>
                {h.alerts.slice(0, 10).map((a) => (
                  <Alert
                    key={a.id}
                    tone={a.severity === 'critical' ? 'danger' : a.severity === 'warning' ? 'warning' : 'success'}
                    title={`${a.title} · ${format.relative(a.raisedAt)}`}
                    action={!a.acknowledged ? <Button size="xs" variant="ghost" onPress={() => h.acknowledge(a.id)}>{t('observability.acknowledge')}</Button> : undefined}
                  >
                    {a.message}
                  </Alert>
                ))}
              </View>
            )}
          </Card>
        </>
      )}

      {tab === 'logs' && (
        <>
          <SegmentedControl value={o.levelFilter} onChange={o.setLevelFilter} options={[{ value: 'all', label: 'All' }, ...levels.slice(0, 4).map((l) => ({ value: l, label: l }))]} />
          <Row wrap>
            {levels.map((l) => (
              <Button key={l} size="xs" variant={l === 'error' || l === 'fatal' ? 'danger' : 'secondary'} onPress={() => o.emitLog(l, `Mobile ${l} message`)}>{l}</Button>
            ))}
            <Button size="xs" variant="outline" onPress={o.throwHandledError}>{t('observability.simulateError')}</Button>
            <Button size="xs" variant="ghost" onPress={o.clearLogs}>{t('common.clear')}</Button>
          </Row>
          <Card>
            {o.logs.slice(0, 80).map((l) => (
              <LogRow key={l.id} time={l.timestamp} badge={l.level} tone={levelTone[l.level]} name={`${l.logger}: ${l.message}`} detail={l.error ? `${l.error.name}: ${l.error.message}` : l.data ? JSON.stringify(l.data) : undefined} />
            ))}
          </Card>
        </>
      )}

      {tab === 'analytics' && (
        <>
          <Row>
            <Button size="sm" onPress={o.trackTestEvent}>Track test event</Button>
            <Button size="sm" variant="ghost" onPress={o.clearEvents}>Clear</Button>
          </Row>
          <Card>
            {o.events.slice(0, 80).map((e) => (
              <LogRow key={e.id} time={e.timestamp} badge={e.type} tone={e.type === 'screen' ? 'primary' : 'neutral'} name={e.name} detail={JSON.stringify(e.properties)} />
            ))}
          </Card>
        </>
      )}

      {tab === 'dynatrace' && (
        <>
          {o.dynatraceAvailable ? <Alert tone="success">{t('observability.dynatraceEnabled')}</Alert> : <Alert tone="info" title="Dry run">{t('observability.dynatraceDisabled')}</Alert>}
          <Button size="sm" variant="ghost" onPress={o.clearDynatrace}>Clear</Button>
          <Card>
            {o.dynatraceCalls.slice(0, 80).map((c) => (
              <LogRow key={c.id} time={c.at} badge={c.method} tone={c.method === 'reportError' ? 'danger' : c.method === 'reportEvent' ? 'primary' : 'neutral'} name={c.name} detail={c.payload ? JSON.stringify(c.payload) : undefined} />
            ))}
          </Card>
        </>
      )}

      {tab === 'lifecycle' && (
        <>
          <Card title={t('observability.lifecycle')}>
            <DescriptionList
              items={[
                { label: t('observability.phase'), value: o.lifecycle.phase },
                { label: 'Visibility', value: o.lifecycle.visibility },
                { label: 'Network', value: o.lifecycle.online ? t('common.online') : t('common.offline') },
                { label: t('observability.backgroundCount'), value: o.lifecycle.backgroundCount },
                { label: 'Ready', value: o.lifecycle.readyAt ? format.dateTime(o.lifecycle.readyAt) : '—' },
              ]}
            />
            <Text variant="caption" tone="muted">Background the app and return to see AppState transitions; toggle airplane mode for NetInfo.</Text>
          </Card>
          <Card title={t('observability.startupTasks')}>
            {o.lifecycle.startupTimings.map((s) => (
              <Row key={s.name}>
                <Badge tone={s.ok ? 'success' : 'danger'} dot>{s.ok ? 'ok' : 'failed'}</Badge>
                <Text style={{ flex: 1 }}>{s.name}</Text>
                <Text variant="caption" tone="muted">{s.durationMs} ms</Text>
              </Row>
            ))}
          </Card>
        </>
      )}
    </Screen>
  );
}
