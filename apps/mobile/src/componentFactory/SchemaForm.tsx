import { View } from 'react-native';
import { Controller } from 'react-hook-form';
import { useSchemaForm, useValidationMessage, type FormSchema } from '@erui/core';
import { Alert, Button, Card, CodeBlock } from '../components/ui';
import { nativeFieldRegistry } from './nativeFieldRegistry';

/** Renders any FormSchema through the native component factory. */
export function SchemaForm({ schema }: { schema: FormSchema }) {
  const { form, sections, onSubmit, isSubmitting, lastSubmission, reset } = useSchemaForm(schema);
  const translate = useValidationMessage();
  return (
    <View style={{ gap: 16 }}>
      {sections.map((section) => (
        <Card key={section.id} title={section.title} subtitle={section.description}>
          <View style={{ gap: 16 }}>
            {section.fields.map((field) => {
              const Renderer = nativeFieldRegistry.resolve(field.type);
              return (
                <Controller
                  key={field.name}
                  control={form.control}
                  name={field.name}
                  render={({ field: f, fieldState }) => (
                    <Renderer field={field} value={f.value} onChange={f.onChange} onBlur={f.onBlur} error={translate(fieldState.error?.message)} />
                  )}
                />
              );
            })}
          </View>
        </Card>
      ))}
      <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'flex-end' }}>
        <Button variant="ghost" onPress={reset}>Reset</Button>
        <Button leftIcon="send" loading={isSubmitting} onPress={() => void onSubmit()}>
          {schema.submitLabel ?? 'Submit'}
        </Button>
      </View>
      {lastSubmission && (
        <Alert tone="success" title="Submitted payload">
          <CodeBlock code={JSON.stringify(lastSubmission, null, 2)} maxHeight={220} />
        </Alert>
      )}
    </View>
  );
}
