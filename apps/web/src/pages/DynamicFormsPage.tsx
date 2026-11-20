import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SAMPLE_FORM_SCHEMAS } from '@erui/core';
import { Accordion, Card, CodeBlock, SegmentedControl } from '../components/ui';
import { SchemaForm } from '../componentFactory/SchemaForm';
import { webFieldRegistry } from '../componentFactory/webFieldRegistry';
import { PageHeader } from '../layout/PageHeader';

/** UI Component factory - Web: JSON schema -> registered DOM controls. */
export default function DynamicFormsPage() {
  const { t } = useTranslation();
  const [schemaId, setSchemaId] = useState(SAMPLE_FORM_SCHEMAS[0]!.id);
  const schema = SAMPLE_FORM_SCHEMAS.find((s) => s.id === schemaId)!;

  return (
    <div className="stack gap-lg">
      <PageHeader
        title={t('dynamicForms.title')}
        subtitle={t('dynamicForms.subtitle')}
        actions={
          <SegmentedControl
            value={schemaId}
            onChange={setSchemaId}
            options={SAMPLE_FORM_SCHEMAS.map((s) => ({ value: s.id, label: s.title }))}
          />
        }
      />
      <div className="grid grid--3-1">
        {/* key resets the form when the schema changes */}
        <SchemaForm key={schema.id} schema={schema} />
        <div className="stack gap-md">
          <Card title={schema.title} subtitle={schema.description}>
            <div className="text-sm text-muted">
              Registered field renderers: <code>{webFieldRegistry.keys().join(', ')}</code>
            </div>
          </Card>
          <Accordion items={[{ id: 'json', title: t('dynamicForms.schemaPreview'), icon: 'file', content: <CodeBlock code={JSON.stringify(schema, null, 2)} maxHeight={420} /> }]} />
        </div>
      </div>
    </div>
  );
}
