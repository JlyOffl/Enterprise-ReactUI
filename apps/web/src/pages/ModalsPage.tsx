import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Feature, FLAGS, useModal, type ModalSize } from '@erui/core';
import { Alert, Badge, Button, Card, CodeBlock } from '../components/ui';
import { PageHeader } from '../layout/PageHeader';

/** Modal and Modeless - Web: everything goes through the shared promise-based modal service. */
export default function ModalsPage() {
  const { t } = useTranslation();
  const modal = useModal();
  const [result, setResult] = useState<unknown>('—');
  const windowCount = useRef(0);

  return (
    <div className="stack gap-lg">
      <PageHeader title={t('modals.title')} subtitle={t('modals.subtitle')} />
      <Card title={t('modals.result')}>
        <CodeBlock code={typeof result === 'string' ? result : JSON.stringify(result, null, 2)} maxHeight={160} />
      </Card>
      <div className="grid grid--3">
        <Card title={t('modals.confirmDemo')} subtitle="await modal.confirm(...)">
          <Button
            variant="danger"
            leftIcon="trash"
            onClick={async () => setResult((await modal.confirm({ title: t('modals.confirmTitle'), message: 'modals.confirmMessage', tone: 'danger', confirmLabel: t('common.delete') })) ? t('modals.confirmed') : t('modals.dismissed'))}
          >
            {t('common.delete')}…
          </Button>
        </Card>
        <Card title={t('modals.alertDemo')} subtitle="await modal.alert(...)">
          <Button
            variant="secondary"
            leftIcon="info"
            onClick={async () => {
              await modal.alert('Maintenance window', 'Systems will be read-only Saturday 02:00–04:00 UTC.');
              setResult('alert closed');
            }}
          >
            Show alert
          </Button>
        </Card>
        <Card title={t('modals.formModal')} subtitle="Resolves with form data">
          <Button leftIcon="edit" onClick={async () => setResult((await modal.open('demo.quickNote', {}, { title: 'New note', size: 'md' }).result) ?? 'cancelled')}>
            New note
          </Button>
        </Card>
        <Card title={t('modals.drawer')} subtitle="Side sheet, left or right">
          <div className="row gap-sm">
            <Button variant="secondary" leftIcon="filter" onClick={async () => setResult((await modal.drawer('demo.filters', {}, { title: 'Filters', size: 'sm' }).result) ?? 'cancelled')}>
              Right
            </Button>
            <Button variant="secondary" onClick={async () => setResult((await modal.drawer('demo.filters', {}, { title: 'Filters', size: 'sm', placement: 'left' }).result) ?? 'cancelled')}>
              Left
            </Button>
          </div>
        </Card>
        <Card title={t('modals.nested')} subtitle="Stacked dialogs">
          <Button variant="secondary" leftIcon="layers" onClick={() => modal.open('demo.nested', {}, { title: 'Parent dialog' })}>
            Open
          </Button>
        </Card>
        <Card title="Sizes" subtitle="sm · md · lg · xl">
          <div className="row wrap gap-xs">
            {(['sm', 'md', 'lg', 'xl'] as ModalSize[]).map((size) => (
              <Button key={size} size="sm" variant="outline" onClick={() => modal.open('demo.quickNote', {}, { title: `Size ${size}`, size })}>
                {size}
              </Button>
            ))}
          </div>
        </Card>
      </div>
      <Card
        title={t('modals.modeless')}
        subtitle="Non-blocking floating windows: drag, minimize, focus to front"
        actions={<Badge tone="info">{FLAGS.modelessWindows}</Badge>}
      >
        <Feature flag={FLAGS.modelessWindows} fallback={<Alert tone="warning">Modeless windows are disabled by feature flag.</Alert>}>
          <div className="row gap-sm">
            <Button
              leftIcon="window"
              onClick={() => {
                windowCount.current += 1;
                const n = windowCount.current;
                modal.modeless('demo.inspector', { n, openedAt: new Date().toISOString() }, { title: t('modals.windowTitle', { n }), size: 'sm' });
              }}
            >
              {t('modals.openWindow')}
            </Button>
            <Button variant="ghost" onClick={modal.closeAll}>
              Close all
            </Button>
          </div>
        </Feature>
      </Card>
    </div>
  );
}
