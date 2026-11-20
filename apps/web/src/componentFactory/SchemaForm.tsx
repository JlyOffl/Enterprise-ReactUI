import { Controller } from 'react-hook-form';
import { useSchemaForm, useValidationMessage, type FormSchema } from '@erui/core';
import { Alert, Button, Card, CodeBlock } from '../components/ui';
import { webFieldRegistry } from './webFieldRegistry';

/** Renders any FormSchema through the web component factory. */
export function SchemaForm({ schema }: { schema: FormSchema }) {
  const { form, sections, onSubmit, isSubmitting, lastSubmission, reset } = useSchemaForm(schema);
  const translate = useValidationMessage();

  return (
    <form onSubmit={onSubmit} noValidate className="stack gap-lg">
      {sections.map((section) => (
        <Card key={section.id} title={section.title} subtitle={section.description}>
          <div className="form-grid">
            {section.fields.map((field) => {
              const Renderer = webFieldRegistry.resolve(field.type);
              return (
                <div key={field.name} className={field.width === 'half' ? 'span-1' : 'span-2'}>
                  <Controller
                    control={form.control}
                    name={field.name}
                    render={({ field: f, fieldState }) => (
                      <Renderer
                        field={field}
                        value={f.value}
                        onChange={f.onChange}
                        onBlur={f.onBlur}
                        error={translate(fieldState.error?.message)}
                      />
                    )}
                  />
                </div>
              );
            })}
          </div>
        </Card>
      ))}
      <div className="row gap-sm justify-end">
        <Button variant="ghost" onClick={reset}>
          Reset
        </Button>
        <Button type="submit" loading={isSubmitting} leftIcon="send">
          {schema.submitLabel ?? 'Submit'}
        </Button>
      </div>
      {lastSubmission && (
        <Alert tone="success" title="Submitted payload">
          <CodeBlock code={JSON.stringify(lastSubmission, null, 2)} maxHeight={220} />
        </Alert>
      )}
    </form>
  );
}
