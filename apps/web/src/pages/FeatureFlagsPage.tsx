import { useTranslation } from 'react-i18next';
import { Feature, FLAGS, useFeatureFlagAdmin, useLocale } from '@erui/core';
import { Alert, Badge, Button, Card, IconButton, Switch } from '../components/ui';
import { PageHeader } from '../layout/PageHeader';

const categoryTone = { module: 'primary', ui: 'info', experimental: 'warning', ops: 'neutral' } as const;

export default function FeatureFlagsPage() {
  const { t } = useTranslation();
  const { format } = useLocale();
  const admin = useFeatureFlagAdmin();

  return (
    <div className="stack gap-lg">
      <PageHeader
        title={t('featureFlags.title')}
        subtitle={t('featureFlags.subtitle')}
        actions={
          <>
            <Button variant="secondary" leftIcon="refresh" loading={admin.status === 'loading'} onClick={admin.refresh}>
              {t('featureFlags.refresh')}
            </Button>
            <Button variant="ghost" disabled={!admin.overrideCount} onClick={admin.resetOverrides}>
              {t('featureFlags.resetOverrides')} ({admin.overrideCount})
            </Button>
          </>
        }
      />
      <div className="row gap-sm text-sm text-muted">
        <Badge tone={admin.source === 'remote' ? 'success' : 'neutral'} dot>
          {t('featureFlags.source')}: {admin.source}
        </Badge>
        {admin.lastLoadedAt && (
          <span>
            {t('featureFlags.lastLoaded')}: {format.relative(admin.lastLoadedAt)}
          </span>
        )}
      </div>

      <Card padding="none">
        <ul className="flag-list">
          {admin.flags.map((f) => (
            <li key={f.key} className="flag-list__item">
              <div className="stack gap-xxs grow">
                <div className="row gap-sm wrap">
                  <code>{f.key}</code>
                  <Badge tone={categoryTone[f.category]}>{f.category}</Badge>
                  {f.rolloutPercentage !== undefined && <Badge tone="neutral">{f.rolloutPercentage}% rollout</Badge>}
                  {f.overridden && (
                    <Badge tone="warning" variant="outline" icon="edit">
                      {t('featureFlags.overridden')} (remote: {String(f.remoteValue)})
                    </Badge>
                  )}
                </div>
                <span className="text-muted text-sm">{f.description}</span>
              </div>
              {f.overridden && <IconButton icon="refresh" size="sm" label={t('featureFlags.clearOverride')} onClick={() => admin.clearOverride(f.key)} />}
              <Switch checked={f.value} onChange={(v) => admin.setOverride(f.key, v)} />
            </li>
          ))}
        </ul>
      </Card>

      <Card title="Declarative usage" subtitle="<Feature flag=…> and useFeatureFlag()">
        <Feature flag={FLAGS.aiAssist} fallback={<Alert tone="info">`{FLAGS.aiAssist}` is OFF — toggle it above to reveal the AI assistant panel.</Alert>}>
          <Alert tone="success" title="AI assist enabled">This panel is rendered only when the flag is on, on web and mobile alike.</Alert>
        </Feature>
      </Card>
    </div>
  );
}
