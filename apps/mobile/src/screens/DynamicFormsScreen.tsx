import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SAMPLE_FORM_SCHEMAS } from '@erui/core';
import { Accordion, CodeBlock, SegmentedControl, Text } from '../components/ui';
import { Screen } from '../components/Screen';
import { SchemaForm } from '../componentFactory/SchemaForm';
import { nativeFieldRegistry } from '../componentFactory/nativeFieldRegistry';

/** UI Component factory - Mobile: identical JSON schemas, native renderers. */
export default function DynamicFormsScreen() {
  const { t } = useTranslation();
  const [schemaId, setSchemaId] = useState(SAMPLE_FORM_SCHEMAS[0]!.id);
  const schema = SAMPLE_FORM_SCHEMAS.find((s) => s.id === schemaId)!;
  return (
    <Screen title={t('dynamicForms.title')} subtitle={t('dynamicForms.subtitle')}>
      <SegmentedControl value={schemaId} onChange={setSchemaId} options={SAMPLE_FORM_SCHEMAS.map((s) => ({ value: s.id, label: s.title }))} />
      <Text variant="caption" tone="muted">Renderers: {nativeFieldRegistry.keys().join(', ')}</Text>
      <SchemaForm key={schema.id} schema={schema} />
      <Accordion items={[{ id: 'json', title: t('dynamicForms.schemaPreview'), icon: 'file', content: <CodeBlock code={JSON.stringify(schema, null, 2)} maxHeight={360} /> }]} />
    </Screen>
  );
}
