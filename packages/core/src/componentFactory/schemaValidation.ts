import { z } from 'zod';
import { vmsg } from '../validation/messages';
import type { FieldSchema, FormSchema } from './types';

export function isEmpty(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === '' ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === 'number' && Number.isNaN(value))
  );
}

export function isFieldVisible(field: FieldSchema, values: Record<string, unknown>): boolean {
  return !field.visibleWhen || values[field.visibleWhen.field] === field.visibleWhen.equals;
}

/** Validates a single field value against its schema; returns an i18n message or undefined. */
export function validateField(field: FieldSchema, value: unknown): string | undefined {
  if (field.type === 'checkbox' && field.required && value !== true) return vmsg('validation.required');
  if (isEmpty(value)) return field.required ? vmsg('validation.required') : undefined;

  if (typeof value === 'string') {
    if (field.type === 'email' && !z.string().email().safeParse(value).success) return vmsg('validation.email');
    if (field.minLength && value.length < field.minLength) return vmsg('validation.minLength', { count: field.minLength });
    if (field.maxLength && value.length > field.maxLength) return vmsg('validation.maxLength', { count: field.maxLength });
    if (field.pattern && !new RegExp(field.pattern).test(value)) return vmsg('validation.pattern');
  }
  if (typeof value === 'number') {
    if (field.min !== undefined && value < field.min) return vmsg('validation.min', { min: field.min });
    if (field.max !== undefined && value > field.max) return vmsg('validation.max', { max: field.max });
  }
  if (Array.isArray(value) && field.min && value.length < field.min) {
    return vmsg('validation.selectAtLeast', { count: field.min });
  }
  return undefined;
}

/** Builds a zod schema from a JSON form schema (visibility-aware). */
export function buildZodSchema(schema: FormSchema, isFieldEnabled: (f: FieldSchema) => boolean = () => true) {
  const fields = schema.sections.flatMap((s) => s.fields);
  return z.record(z.string(), z.unknown()).superRefine((values, ctx) => {
    for (const field of fields) {
      if (!isFieldEnabled(field) || !isFieldVisible(field, values)) continue;
      const message = validateField(field, values[field.name]);
      if (message) ctx.addIssue({ code: z.ZodIssueCode.custom, path: [field.name], message });
    }
  });
}

export function defaultValuesFor(schema: FormSchema): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const field of schema.sections.flatMap((s) => s.fields)) {
    if (field.defaultValue !== undefined) out[field.name] = field.defaultValue;
    else if (field.type === 'checkbox' || field.type === 'switch') out[field.name] = false;
    else if (field.type === 'multiselect') out[field.name] = [];
    else if (field.type === 'slider' || field.type === 'rating') out[field.name] = field.min ?? 0;
    else out[field.name] = '';
  }
  return out;
}
