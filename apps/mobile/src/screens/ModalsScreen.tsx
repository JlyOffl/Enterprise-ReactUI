import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Feature, FLAGS, useModal } from '@erui/core';
import { Alert, Button, Card, CodeBlock } from '../components/ui';
import { Row, Screen } from '../components/Screen';

/** Modal and Modeless - Mobile: same promise-based modal service as web. */
export default function ModalsScreen() {
  const { t } = useTranslation();
  const modal = useModal();
  const [result, setResult] = useState<unknown>('—');
  const count = useRef(0);

  return (
    <Screen title={t('modals.title')} subtitle={t('modals.subtitle')}>
      <Card title={t('modals.result')}>
        <CodeBlock code={typeof result === 'string' ? result : JSON.stringify(result, null, 2)} maxHeight={140} />
      </Card>
      <Card title={t('modals.confirmDemo')} subtitle="await modal.confirm(...)">
        <Button
          variant="danger"
          leftIcon="trash"
          onPress={async () => setResult((await modal.confirm({ title: t('modals.confirmTitle'), message: 'modals.confirmMessage', tone: 'danger', confirmLabel: t('common.delete') })) ? t('modals.confirmed') : t('modals.dismissed'))}
        >
          {t('common.delete')}
        </Button>
      </Card>
      <Card title={t('modals.alertDemo')}>
        <Button variant="secondary" leftIcon="info" onPress={async () => (await modal.alert('Maintenance window', 'Systems will be read-only Saturday 02:00–04:00 UTC.'), setResult('alert closed'))}>
          Show alert
        </Button>
      </Card>
      <Card title={t('modals.formModal')}>
        <Button leftIcon="edit" onPress={async () => setResult((await modal.open('demo.quickNote', {}, { title: 'New note' }).result) ?? 'cancelled')}>New note</Button>
      </Card>
      <Card title={t('modals.drawer')} subtitle="Bottom sheet on phones">
        <Button variant="secondary" leftIcon="filter" onPress={async () => setResult((await modal.drawer('demo.filters', {}, { title: 'Filters' }).result) ?? 'cancelled')}>Filters</Button>
      </Card>
      <Card title={t('modals.nested')}>
        <Button variant="secondary" leftIcon="layers" onPress={() => modal.open('demo.nested', {}, { title: 'Parent dialog' })}>Open</Button>
      </Card>
      <Card title={t('modals.modeless')} subtitle="Floating, draggable, non-blocking">
        <Feature flag={FLAGS.modelessWindows} fallback={<Alert tone="warning">Disabled by feature flag.</Alert>}>
          <Row>
            <Button
              leftIcon="window"
              onPress={() => {
                count.current += 1;
                modal.modeless('demo.inspector', { n: count.current, openedAt: new Date().toISOString() }, { title: t('modals.windowTitle', { n: count.current }) });
              }}
            >
              {t('modals.openWindow')}
            </Button>
            <Button variant="ghost" onPress={modal.closeAll}>Close all</Button>
          </Row>
        </Feature>
      </Card>
    </Screen>
  );
}
