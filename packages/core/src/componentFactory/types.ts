import type { Permission } from '../auth/permissions';

export type FieldType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'textarea'
  | 'select'
  | 'combobox'
  | 'radio'
  | 'checkbox'
  | 'switch'
  | 'date'
  | 'slider'
  | 'rating'
  | 'multiselect';

export interface FieldOption {
  value: string;
  label: string;
}

/** Declarative field definition rendered by the platform component factory. */
export interface FieldSchema {
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helperText?: string;
  options?: FieldOption[];
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  defaultValue?: unknown;
  /** Show only when another field has a given value. */
  visibleWhen?: { field: string; equals: unknown };
  featureFlag?: string;
  permission?: Permission;
  width?: 'full' | 'half';
}

export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FieldSchema[];
}

export interface FormSchema {
  id: string;
  title: string;
  description?: string;
  submitLabel?: string;
  sections: FormSection[];
}

/** Contract every platform field renderer implements. */
export interface FieldRendererProps {
  field: FieldSchema;
  value: unknown;
  onChange(value: unknown): void;
  onBlur(): void;
  error?: string;
  disabled?: boolean;
}
