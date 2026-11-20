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
 * UI Component factory - Web. Maps the shared FieldType vocabulary to DOM controls.
 * Mobile registers React Native controls for the very same keys.
 */
const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v));

export const webFieldRegistry = new ComponentRegistry<ComponentType<FieldRendererProps>>('web-fields').registerMany({
  text: ({ field, value, onChange, onBlur, error }) => (
    <TextField label={field.label} required={field.required} placeholder={field.placeholder} helperText={field.helperText} value={str(value)} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} error={error} />
  ),
  email: ({ field, value, onChange, onBlur, error }) => (
    <TextField type="email" leftIcon="globe" label={field.label} required={field.required} placeholder={field.placeholder ?? 'name@company.com'} value={str(value)} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} error={error} />
  ),
  password: ({ field, value, onChange, onBlur, error }) => (
    <TextField type="password" label={field.label} required={field.required} value={str(value)} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} error={error} />
  ),
  number: ({ field, value, onChange, onBlur, error }) => (
    <TextField type="number" label={field.label} required={field.required} min={field.min} max={field.max} step={field.step} value={value === '' || value == null ? '' : Number(value)} onChange={(e) => onChange(e.target.value === '' ? '' : e.target.valueAsNumber)} onBlur={onBlur} error={error} />
  ),
  textarea: ({ field, value, onChange, onBlur, error }) => (
    <TextArea label={field.label} required={field.required} rows={4} maxLength={field.maxLength} showCount={!!field.maxLength} value={str(value)} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} error={error} />
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
    <RadioGroup label={field.label} required={field.required} options={field.options ?? []} value={str(value)} onChange={onChange} direction="row" variant="card" error={error} />
  ),
  checkbox: ({ field, value, onChange, onBlur, error }) => (
    <Checkbox label={field.label} checked={value === true} onChange={onChange} onBlur={onBlur} error={error} />
  ),
  switch: ({ field, value, onChange }) => <Switch label={field.label} checked={value === true} onChange={onChange} />,
  date: ({ field, value, onChange, onBlur, error }) => (
    <DatePicker label={field.label} required={field.required} value={str(value)} onChange={onChange} onBlur={onBlur} error={error} />
  ),
  slider: ({ field, value, onChange }) => (
    <Slider label={field.label} min={field.min} max={field.max} step={field.step} value={Number(value) || 0} onChange={onChange} />
  ),
  rating: ({ field, value, onChange }) => <Rating label={field.label} value={Number(value) || 0} max={field.max ?? 5} onChange={onChange} />,
});
