import { useId, useRef, type InputHTMLAttributes, type ReactNode, type Ref, type TextareaHTMLAttributes } from 'react';
import { useCounter, useSlider, type SelectOption } from '@erui/core';
import { Icon, type IconKey } from './Icon';
import { cx } from './cx';

/* ------------------------------------------------------------------ Field */
export interface FieldProps {
  label?: ReactNode;
  htmlFor?: string;
  required?: boolean;
  helperText?: ReactNode;
  error?: string;
  children: ReactNode;
  className?: string;
  trailing?: ReactNode;
}

export function Field({ label, htmlFor, required, helperText, error, children, className, trailing }: FieldProps) {
  return (
    <div className={cx('field', error && 'field--invalid', className)}>
      {label && (
        <div className="field__label-row">
          <label className="field__label" htmlFor={htmlFor}>
            {label}
            {required && <span className="field__required" aria-hidden> *</span>}
          </label>
          {trailing}
        </div>
      )}
      {children}
      {error ? (
        <div className="field__error" role="alert" id={htmlFor ? `${htmlFor}-error` : undefined}>
          <Icon name="error" size={13} /> {error}
        </div>
      ) : (
        helperText && <div className="field__help">{helperText}</div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------- TextField */
export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: string;
  leftIcon?: IconKey;
  rightElement?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  ref?: Ref<HTMLInputElement>;
}

export function TextField({ label, helperText, error, leftIcon, rightElement, size = 'md', id, required, className, ...rest }: TextFieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  return (
    <Field label={label} htmlFor={inputId} required={required} helperText={helperText} error={error} className={className}>
      <div className={cx('input', `input--${size}`, error && 'input--invalid', rest.disabled && 'is-disabled')}>
        {leftIcon && <Icon name={leftIcon} size={16} className="input__icon" />}
        <input
          id={inputId}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          required={required}
          {...rest}
        />
        {rightElement && <span className="input__right">{rightElement}</span>}
      </div>
    </Field>
  );
}

export interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: string;
  showCount?: boolean;
  ref?: Ref<HTMLTextAreaElement>;
}

export function TextArea({ label, helperText, error, id, required, showCount, maxLength, className, ...rest }: TextAreaProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const length = typeof rest.value === 'string' ? rest.value.length : undefined;
  return (
    <Field
      label={label}
      htmlFor={inputId}
      required={required}
      helperText={helperText}
      error={error}
      className={className}
      trailing={showCount && maxLength ? <span className="field__count">{length ?? 0}/{maxLength}</span> : undefined}
    >
      <textarea
        id={inputId}
        className={cx('textarea', error && 'input--invalid')}
        aria-invalid={!!error || undefined}
        maxLength={maxLength}
        required={required}
        {...rest}
      />
    </Field>
  );
}

/* ---------------------------------------------------------------- Checkbox */
export interface CheckboxProps {
  label?: ReactNode;
  description?: ReactNode;
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  error?: string;
  id?: string;
  onBlur?: () => void;
}

export function Checkbox({ label, description, checked, indeterminate, onChange, disabled, error, id, onBlur }: CheckboxProps) {
  const autoId = useId();
  return (
    <div className={cx('check', disabled && 'is-disabled')}>
      <label className="check__row" htmlFor={id ?? autoId}>
        <input
          id={id ?? autoId}
          type="checkbox"
          className="check__native"
          checked={checked}
          disabled={disabled}
          onBlur={onBlur}
          ref={(el) => {
            if (el) el.indeterminate = !!indeterminate;
          }}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className={cx('check__box', (checked || indeterminate) && 'is-on')} aria-hidden>
          {indeterminate ? <Icon name="minus" size={12} strokeWidth={3} /> : checked && <Icon name="check" size={12} strokeWidth={3} />}
        </span>
        {label && (
          <span className="check__text">
            <span className="check__label">{label}</span>
            {description && <span className="check__desc">{description}</span>}
          </span>
        )}
      </label>
      {error && <div className="field__error">{error}</div>}
    </div>
  );
}

/* -------------------------------------------------------------- RadioGroup */
export interface RadioGroupProps {
  label?: ReactNode;
  name?: string;
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  direction?: 'row' | 'column';
  variant?: 'default' | 'card';
  error?: string;
  required?: boolean;
}

export function RadioGroup({ label, name, options, value, onChange, direction = 'column', variant = 'default', error, required }: RadioGroupProps) {
  const autoName = useId();
  return (
    <Field label={label} error={error} required={required}>
      <div role="radiogroup" className={cx('radio-group', `radio-group--${direction}`, `radio-group--${variant}`)}>
        {options.map((o) => (
          <label key={o.value} className={cx('radio', value === o.value && 'is-checked', o.disabled && 'is-disabled')}>
            <input
              type="radio"
              className="check__native"
              name={name ?? autoName}
              value={o.value}
              checked={value === o.value}
              disabled={o.disabled}
              onChange={() => onChange(o.value)}
            />
            <span className="radio__dot" aria-hidden />
            <span className="check__text">
              <span className="check__label">{o.label}</span>
              {o.description && <span className="check__desc">{o.description}</span>}
            </span>
          </label>
        ))}
      </div>
    </Field>
  );
}

/* ------------------------------------------------------------------ Switch */
export function Switch({
  label,
  description,
  checked,
  onChange,
  disabled,
  size = 'md',
}: {
  label?: ReactNode;
  description?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md';
}) {
  const id = useId();
  return (
    <div className={cx('switch-row', disabled && 'is-disabled')}>
      {label && (
        <label htmlFor={id} className="check__text">
          <span className="check__label">{label}</span>
          {description && <span className="check__desc">{description}</span>}
        </label>
      )}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        className={cx('switch', `switch--${size}`, checked && 'is-on')}
        onClick={() => onChange(!checked)}
      >
        <span className="switch__thumb" />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ Slider */
export function Slider({
  label,
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  formatValue = (v) => String(v),
  disabled,
  marks,
}: {
  label?: ReactNode;
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  formatValue?: (v: number) => string;
  disabled?: boolean;
  marks?: number[];
}) {
  const slider = useSlider({ min, max, step, value, onChange });
  const trackRef = useRef<HTMLDivElement>(null);

  const updateFromPointer = (clientX: number) => {
    const rect = trackRef.current?.getBoundingClientRect();
    if (rect) slider.setFromRatio((clientX - rect.left) / rect.width);
  };

  return (
    <Field label={label} trailing={<span className="slider__value">{formatValue(slider.value)}</span>}>
      <div
        ref={trackRef}
        className={cx('slider', disabled && 'is-disabled')}
        onPointerDown={(e) => {
          if (disabled) return;
          (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
          updateFromPointer(e.clientX);
        }}
        onPointerMove={(e) => e.buttons === 1 && !disabled && updateFromPointer(e.clientX)}
      >
        <div className="slider__track">
          <div className="slider__fill" style={{ width: `${slider.percent}%` }} />
        </div>
        {marks?.map((m) => (
          <span key={m} className="slider__mark" style={{ left: `${((m - min) / (max - min)) * 100}%` }} />
        ))}
        <div
          role="slider"
          tabIndex={disabled ? -1 : 0}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={slider.value}
          aria-valuetext={formatValue(slider.value)}
          className="slider__thumb"
          style={{ left: `${slider.percent}%` }}
          onKeyDown={(e) => slider.handleKey(e.key) && e.preventDefault()}
        />
      </div>
    </Field>
  );
}

/* ----------------------------------------------------------- NumberStepper */
export function NumberStepper({
  label,
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  error,
}: {
  label?: ReactNode;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
}) {
  const counter = useCounter({ min, max, step, value, onChange });
  return (
    <Field label={label} error={error}>
      <div className={cx('stepper-input', error && 'input--invalid')}>
        <button type="button" onClick={counter.decrement} disabled={!counter.canDecrement} aria-label="Decrease">
          <Icon name="minus" size={14} />
        </button>
        <input
          type="number"
          value={Number.isFinite(value) ? value : ''}
          min={min}
          max={max}
          step={step}
          onChange={(e) => counter.set(e.target.valueAsNumber)}
        />
        <button type="button" onClick={counter.increment} disabled={!counter.canIncrement} aria-label="Increase">
          <Icon name="plus" size={14} />
        </button>
      </div>
    </Field>
  );
}

/* -------------------------------------------------------- SegmentedControl */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
  fullWidth,
}: {
  options: Array<{ value: T; label: ReactNode; icon?: IconKey }>;
  value: T;
  onChange: (v: T) => void;
  size?: 'sm' | 'md';
  fullWidth?: boolean;
}) {
  return (
    <div className={cx('segmented', `segmented--${size}`, fullWidth && 'segmented--block')} role="radiogroup">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={o.value === value}
          className={cx('segmented__item', o.value === value && 'is-active')}
          onClick={() => onChange(o.value)}
        >
          {o.icon && <Icon name={o.icon} size={15} />}
          {o.label}
        </button>
      ))}
    </div>
  );
}
