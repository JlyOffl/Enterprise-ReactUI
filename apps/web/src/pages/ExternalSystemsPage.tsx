import { useTranslation } from 'react-i18next';
import { getErrorMessage, useExternalSystemsWorkbench } from '@erui/core';
import { Alert, Avatar, Badge, Button, Card, CodeBlock, DescriptionList, Select, Spinner, TextField } from '../components/ui';
import { PageHeader } from '../layout/PageHeader';

/** External System Id - Web. */
export default function ExternalSystemsPage() {
  const { t } = useTranslation();
  const w = useExternalSystemsWorkbench();
  const result = w.lookup.data;

  return (
    <div className="stack gap-lg">
      <PageHeader title={t('externalSystems.title')} subtitle={t('externalSystems.subtitle')} />

      <div className="grid grid--2">
        <Card title={t('externalSystems.clientId')} subtitle="Sent on every API request">
          <div className="stack gap-md">
            <code className="pill-code">{w.clientSystemId}</code>
            <span className="text-muted text-sm">{t('externalSystems.headersPreview')}</span>
            <CodeBlock code={JSON.stringify(w.headers, null, 2)} maxHeight={180} />
          </div>
        </Card>

        <Card title={t('externalSystems.linkedIds')}>
          <ul className="ext-list">
            {w.linkedIds.map(({ system, externalId, deepLink }) => (
              <li key={system.id}>
                <span className="ext-swatch" style={{ background: system.color }} />
                <div className="stack grow">
                  <strong>{system.name}</strong>
                  <span className="text-muted text-sm">{system.description}</span>
                </div>
                {externalId ? <code>{externalId}</code> : <Badge>{t('externalSystems.notLinked')}</Badge>}
                {deepLink && (
                  <a href={deepLink} target="_blank" rel="noreferrer" className="btn btn--ghost btn--icon btn--sm" aria-label="Open">
                    ↗
                  </a>
                )}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card title={t('externalSystems.validate')} subtitle="Validate an identifier format, then resolve the matching directory record">
        <form
          className="form-grid"
          onSubmit={(e) => {
            e.preventDefault();
            if (w.canLookup) w.runLookup();
          }}
        >
          <Select
            label={t('externalSystems.systemLabel')}
            value={w.systemId}
            onChange={w.setSystemId}
            options={w.systems.map((s) => ({ value: s.id, label: s.name, description: s.description }))}
          />
          <TextField
            label={t('externalSystems.idLabel')}
            placeholder={w.selectedSystem?.example}
            value={w.value}
            onChange={(e) => w.setValue(e.target.value)}
            helperText={`e.g. ${w.selectedSystem?.example}`}
            error={w.validation && !w.validation.valid ? t(w.validation.messageKey ?? 'validation.pattern') : undefined}
            rightElement={w.validation?.valid ? <Badge tone="success" icon="check">{t('externalSystems.valid')}</Badge> : undefined}
          />
          <div className="span-2 row gap-sm">
            <Button type="submit" leftIcon="search" disabled={!w.canLookup}>
              {t('externalSystems.lookup')}
            </Button>
            <span className="text-muted text-sm">Tip: copy an id from the Users page details drawer.</span>
          </div>
        </form>

        {w.lookup.isFetching && <Spinner />}
        {w.lookup.error && !w.lookup.isFetching && <Alert tone="warning">{getErrorMessage(w.lookup.error)}</Alert>}
        {result && !w.lookup.isFetching && (
          <div className="lookup-result">
            <Avatar name={result.name} size={44} />
            <DescriptionList
              columns={3}
              items={[
                { label: 'Name', value: result.name },
                { label: 'Email', value: result.email },
                { label: 'Department', value: result.department },
              ]}
            />
          </div>
        )}
      </Card>
    </div>
  );
}
