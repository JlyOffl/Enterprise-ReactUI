import { useCallback, useMemo, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAppSelector } from '../store/hooks';
import { selectEffectiveFlags } from '../featureFlags/featureFlagsSlice';
import { selectPermissions } from '../auth/authSlice';
import { hasPermission } from '../auth/permissions';
import { useAnalytics } from '../instrumentation/hooks';
import { baseApi } from '../api/baseApi';
import { buildZodSchema, defaultValuesFor, isFieldVisible } from './schemaValidation';
import type { FieldSchema, FormSchema } from './types';

type Values = Record<string, unknown>;

export const formsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    submitForm: build.mutation<{ id: string; receivedAt: string }, { formId: string; values: Values }>({
      query: ({ formId, values }) => ({ url: `/forms/${formId}/submissions`, method: 'POST', body: values }),
    }),
  }),
});

/**
 * Drives a JSON schema form: default values, zod validation, field visibility rules
 * (visibleWhen / feature flags / permissions) and submission. Platforms render fields via
 * their component factory registry.
 */
export function useSchemaForm(schema: FormSchema) {
  const flags = useAppSelector(selectEffectiveFlags);
  const permissions = useAppSelector(selectPermissions);
  const analytics = useAnalytics();
  const [submitForm, submitState] = formsApi.useSubmitFormMutation();
  const [lastSubmission, setLastSubmission] = useState<Values | null>(null);

  const isFieldEnabled = useCallback(
    (f: FieldSchema) => (!f.featureFlag || !!flags[f.featureFlag]) && hasPermission(permissions, f.permission),
    [flags, permissions],
  );

  const resolver = useMemo(
    () => zodResolver(buildZodSchema(schema, isFieldEnabled)) as unknown as Resolver<Values>,
    [schema, isFieldEnabled],
  );
  const defaultValues = useMemo(() => defaultValuesFor(schema), [schema]);
  const form = useForm<Values>({ resolver, defaultValues, mode: 'onTouched' });
  const values = form.watch();

  const sections = useMemo(
    () =>
      schema.sections
        .map((s) => ({ ...s, fields: s.fields.filter((f) => isFieldEnabled(f) && isFieldVisible(f, values)) }))
        .filter((s) => s.fields.length > 0),
    [schema, isFieldEnabled, values],
  );

  const onSubmit = form.handleSubmit(async (data) => {
    const visible = Object.fromEntries(
      sections.flatMap((s) => s.fields).map((f) => [f.name, data[f.name]]),
    );
    await submitForm({ formId: schema.id, values: visible }).unwrap();
    setLastSubmission(visible);
    analytics.track('forms.dynamic_submitted', { formId: schema.id });
  });

  return {
    form,
    sections,
    onSubmit,
    isSubmitting: submitState.isLoading,
    lastSubmission,
    reset: () => {
      form.reset(defaultValues);
      setLastSubmission(null);
    },
  };
}
