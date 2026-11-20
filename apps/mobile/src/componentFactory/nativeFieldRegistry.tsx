import type { ComponentType } from 'react';
import { ComponentRegistry, type FieldRendererProps } from '@erui/core';
import {
  Checkbox,
  Combobox,
  DatePicker,
  MultiSelect,
  RadioGroup,
  Rating,
  Select,
  Slider,
  Switch,
  TextArea,
  TextField,
} from '../components/ui';

/**
 * UI Component factory - Mobile. Same FieldType keys as the web registry, rendered with
 * React Native controls.
 */
const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));

export const nativeFieldRegistry = new ComponentRegistry<ComponentType<FieldRendererProps>>('native-fields').registerMany({
  text: ({ field, value, onChange, onBlur, error }) => (
    <TextField label={field.label} required={field.required} placeholder={field.placeholder} value={str(value)} onChangeText={onChange} onBlur={onBlur} error={error} />
  ),
  email: ({ field, value, onChange, onBlur, error }) => (
    <TextField label={field.label} required={field.required} leftIcon="globe" keyboardType="email-address" autoCapitalize="none" value={str(value)} onChangeText={onChange} onBlur={onBlur} error={error} />
  ),
  password: ({ field, value, onChange, onBlur, error }) => (
    <TextField label={field.label} required={field.required} secureTextEntry value={str(value)} onChangeText={onChange} onBlur={onBlur} error={error} />
  ),
  number: ({ field, value, onChange, onBlur, error }) => (
    <TextField
      label={field.label}
      required={field.required}
      keyboardType="numeric"
      value={value === '' || value == null ? '' : String(value)}
      onChangeText={(t) => onChange(t === '' ? '' : Number(t.replace(/[^0-9.]/g, '')))}
      onBlur={onBlur}
      error={error}
    />
  ),
  textarea: ({ field, value, onChange, onBlur, error }) => (
    <TextArea label={field.label} required={field.required} maxLength={field.maxLength} showCount={!!field.maxLength} value={str(value)} onChangeText={onChange} onBlur={onBlur} error={error} />
  ),
  select: ({ field, value, onChange, onBlur, error }) => (
    <Select label={field.label} required={field.required} options={field.options ?? []} value={str(value)} onChange={onChange} onBlur={onBlur} error={error} />
  ),
  combobox: ({ field, value, onChange, onBlur, error }) => (
    <Combobox label={field.label} required={field.required} options={field.options ?? []} value={str(value)} onChange={onChange} onBlur={onBlur} error={error} />
  ),
  multiselect: ({ field, value, onChange, onBlur, error }) => (
    <MultiSelect label={field.label} required={field.required} options={field.options ?? []} value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} onBlur={onBlur} error={error} />
  ),
  radio: ({ field, value, onChange, error }) => (
    <RadioGroup label={field.label} required={field.required} variant="card" options={field.options ?? []} value={str(value)} onChange={onChange} error={error} />
  ),
  checkbox: ({ field, value, onChange, error }) => <Checkbox label={field.label} checked={value === true} onChange={onChange} error={error} />,
  switch: ({ field, value, onChange }) => <Switch label={field.label} checked={value === true} onChange={onChange} />,
  date: ({ field, value, onChange, onBlur, error }) => (
    <DatePicker label={field.label} required={field.required} value={str(value)} onChange={onChange} onBlur={onBlur} error={error} />
  ),
  slider: ({ field, value, onChange }) => (
    <Slider label={field.label} min={field.min} max={field.max} step={field.step} value={Number(value) || 0} onChange={onChange} />
  ),
  rating: ({ field, value, onChange }) => <Rating label={field.label} value={Number(value) || 0} max={field.max ?? 5} onChange={onChange} />,
});
