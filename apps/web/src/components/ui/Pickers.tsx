import { useCallback, useId, useRef, useState, type ReactNode } from 'react';
import {
  formatBytes,
  formatDate,
  useCalendar,
  useCombobox,
  useFileUpload,
  useLocale,
  useMultiSelect,
  useRating,
  useSelect,
  type FileDescriptor,
  type SelectOption,
} from '@erui/core';
import { Field } from './FormControls';
import { Icon } from './Icon';
import { Chip, ProgressBar } from './Feedback';
import { Button, IconButton } from './Button';
import { cx, useDismiss } from './cx';

interface BaseFieldProps {
  label?: ReactNode;
  helperText?: ReactNode;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  onBlur?: () => void;
}

/* ------------------------------------------------------------------ Select */
export function Select({
  label,
  options,
  value,
  onChange,
  placeholder = 'Select…',
  helperText,
  error,
  required,
  disabled,
  onBlur,
}: BaseFieldProps & { options: SelectOption[]; value: string; onChange: (v: string) => void }) {
  const select = useSelect({ options, value, onChange });
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const close = useCallback(() => {
    select.close();
    onBlur?.();
  }, [select, onBlur]);
  useDismiss(ref, select.isOpen, close);

  return (
    <Field label={label} htmlFor={id} helperText={helperText} error={error} required={required}>
      <div className="popover-anchor" ref={ref}>
        <button
          id={id}
          type="button"
          className={cx('input', 'select__trigger', error && 'input--invalid', disabled && 'is-disabled')}
          aria-haspopup="listbox"
          aria-expanded={select.isOpen}
          disabled={disabled}
          onClick={select.toggle}
          onKeyDown={(e) => select.handleKey(e.key) && e.preventDefault()}
        >
          <span className={cx('select__value', !select.selectedOption && 'is-placeholder')}>
            {select.selectedOption?.label ?? placeholder}
          </span>
          <Icon name="chevronDown" size={16} className="select__chevron" />
        </button>
        {select.isOpen && (
          <ul className="listbox" role="listbox">
            {options.map((o, i) => (
              <li
                key={o.value}
                role="option"
                aria-selected={o.value === value}
                aria-disabled={o.disabled}
                className={cx('listbox__option', i === select.highlightedIndex && 'is-highlighted', o.value === value && 'is-selected', o.disabled && 'is-disabled')}
                onMouseEnter={() => select.setHighlightedIndex(i)}
                onClick={() => select.select(o.value)}
              >
                <span className="listbox__text">
                  <span>{o.label}</span>
                  {o.description && <span className="listbox__desc">{o.description}</span>}
                </span>
                {o.value === value && <Icon name="check" size={15} />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Field>
  );
}

/* ---------------------------------------------------------------- Combobox */
export function Combobox({
  label,
  options,
  value,
  onChange,
  placeholder = 'Search…',
  helperText,
  error,
  required,
  disabled,
  onBlur,
}: BaseFieldProps & { options: SelectOption[]; value: string; onChange: (v: string) => void }) {
  const combo = useCombobox({ options, value, onChange });
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();
  const { t } = useLocale();
  const close = useCallback(() => {
    combo.close();
    onBlur?.();
  }, [combo, onBlur]);
  useDismiss(ref, combo.isOpen, close);

  return (
    <Field label={label} htmlFor={id} helperText={helperText} error={error} required={required}>
      <div className="popover-anchor" ref={ref}>
        <div className={cx('input', error && 'input--invalid', disabled && 'is-disabled')}>
          <Icon name="search" size={16} className="input__icon" />
          <input
            id={id}
            role="combobox"
            aria-expanded={combo.isOpen}
            aria-autocomplete="list"
            autoComplete="off"
            placeholder={placeholder}
            value={combo.query}
            disabled={disabled}
            onFocus={combo.open}
            onChange={(e) => combo.setQuery(e.target.value)}
            onKeyDown={(e) => combo.handleKey(e.key) && e.preventDefault()}
          />
          {combo.selected && (
            <button type="button" className="input__clear" aria-label="Clear" onClick={combo.clear}>
              <Icon name="x" size={14} />
            </button>
          )}
        </div>
        {combo.isOpen && (
          <ul className="listbox" role="listbox">
            {combo.filtered.length === 0 && <li className="listbox__empty">{t('common.noResults')}</li>}
            {combo.filtered.map((o, i) => (
              <li
                key={o.value}
                role="option"
                aria-selected={o.value === combo.selected}
                className={cx('listbox__option', i === combo.highlightedIndex && 'is-highlighted', o.value === combo.selected && 'is-selected', o.disabled && 'is-disabled')}
                onMouseEnter={() => combo.setHighlightedIndex(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => combo.select(o)}
              >
                <span className="listbox__text">
                  <span>{o.label}</span>
                  {o.description && <span className="listbox__desc">{o.description}</span>}
                </span>
                {o.value === combo.selected && <Icon name="check" size={15} />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Field>
  );
}

/* ---------------------------------------------------------- MultiSelect */
export function MultiSelect({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Add…',
  allowCustom,
  helperText,
  error,
  required,
  onBlur,
}: BaseFieldProps & {
  options?: SelectOption[];
  value: string[];
  onChange: (v: string[]) => void;
  allowCustom?: boolean;
}) {
  const multi = useMultiSelect({ value, onChange, allowCustom });
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const close = useCallback(() => {
    setOpen(false);
    onBlur?.();
  }, [onBlur]);
  useDismiss(ref, open, close);
  const labelOf = (v: string) => options.find((o) => o.value === v)?.label ?? v;
  const suggestions = options.filter(
    (o) => !multi.has(o.value) && o.label.toLowerCase().includes(multi.inputValue.toLowerCase()),
  );

  return (
    <Field label={label} helperText={helperText} error={error} required={required}>
      <div className="popover-anchor" ref={ref}>
        <div className={cx('input', 'tag-input', error && 'input--invalid')} onClick={() => setOpen(true)}>
          {multi.values.map((v) => (
            <Chip key={v} label={labelOf(v)} onRemove={() => multi.remove(v)} />
          ))}
          <input
            value={multi.inputValue}
            placeholder={multi.values.length ? '' : placeholder}
            onFocus={() => setOpen(true)}
            onChange={(e) => multi.setInputValue(e.target.value)}
            onKeyDown={(e) => multi.handleKey(e.key) && e.preventDefault()}
          />
        </div>
        {open && suggestions.length > 0 && (
          <ul className="listbox" role="listbox" aria-multiselectable>
            {suggestions.map((o) => (
              <li
                key={o.value}
                role="option"
                aria-selected={false}
                className={cx('listbox__option', o.disabled && 'is-disabled')}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => !o.disabled && multi.add(o.value)}
              >
                <span className="listbox__text">
                  <span>{o.label}</span>
                  {o.description && <span className="listbox__desc">{o.description}</span>}
                </span>
                <Icon name="plus" size={14} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </Field>
  );
}

/* --------------------------------------------------------------- DatePicker */
export function DatePicker({
  label,
  value,
  onChange,
  min,
  max,
  placeholder = 'Pick a date',
  helperText,
  error,
  required,
  disabled,
  onBlur,
}: BaseFieldProps & { value: string; onChange: (iso: string) => void; min?: string; max?: string }) {
  const { locale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const cal = useCalendar({ value, onChange: (iso) => (onChange(iso), setOpen(false)), min, max, locale });
  const close = useCallback(() => {
    setOpen(false);
    onBlur?.();
  }, [onBlur]);
  useDismiss(ref, open, close);
  const id = useId();

  return (
    <Field label={label} htmlFor={id} helperText={helperText} error={error} required={required}>
      <div className="popover-anchor" ref={ref}>
        <button
          id={id}
          type="button"
          disabled={disabled}
          className={cx('input', 'select__trigger', error && 'input--invalid', disabled && 'is-disabled')}
          onClick={() => setOpen((o) => !o)}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <Icon name="calendar" size={16} className="input__icon" />
          <span className={cx('select__value', !value && 'is-placeholder')}>
            {value ? formatDate(`${value}T00:00:00`, locale, { dateStyle: 'long' }) : placeholder}
          </span>
        </button>
        {open && (
          <div className="calendar" role="dialog" aria-label="Choose date">
            <div className="calendar__header">
              <IconButton icon="chevronLeft" label="Previous month" size="sm" onClick={cal.prevMonth} />
              <span className="calendar__title">{cal.monthLabel}</span>
              <IconButton icon="chevronRight" label="Next month" size="sm" onClick={cal.nextMonth} />
            </div>
            <div className="calendar__grid">
              {cal.weekdayLabels.map((d, i) => (
                <span key={i} className="calendar__weekday">
                  {d}
                </span>
              ))}
              {cal.weeks.flat().map((day) => (
                <button
                  key={day.iso}
                  type="button"
                  disabled={day.isDisabled}
                  className={cx('calendar__day', !day.inMonth && 'is-outside', day.isToday && 'is-today', day.isSelected && 'is-selected')}
                  onClick={() => cal.select(day.iso)}
                >
                  {day.day}
                </button>
              ))}
            </div>
            <div className="calendar__footer">
              <Button size="xs" variant="ghost" onClick={cal.goToToday}>
                Today
              </Button>
              {value && (
                <Button size="xs" variant="ghost" onClick={() => (cal.clear(), setOpen(false))}>
                  Clear
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </Field>
  );
}

/* ------------------------------------------------------------------ Rating */
export function Rating({
  value,
  onChange,
  max = 5,
  readOnly,
  size = 22,
  label,
}: {
  value: number;
  onChange?: (v: number) => void;
  max?: number;
  readOnly?: boolean;
  size?: number;
  label?: ReactNode;
}) {
  const rating = useRating({ value, onChange, max, readOnly });
  const content = (
    <div
      className={cx('rating', readOnly && 'is-readonly')}
      role="slider"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      tabIndex={readOnly ? -1 : 0}
      onKeyDown={(e) => rating.handleKey(e.key) && e.preventDefault()}
      onMouseLeave={() => rating.setHover(null)}
    >
      {rating.items.map((item) => (
        <button
          key={item.index}
          type="button"
          tabIndex={-1}
          disabled={readOnly}
          className={cx('rating__star', item.filled && 'is-filled')}
          onMouseEnter={() => rating.setHover(item.index)}
          onClick={() => rating.select(item.index)}
          aria-label={`${item.index} of ${max}`}
        >
          <svg width={size} height={size} viewBox="0 0 24 24">
            <path d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3l-5.9 3.3 1.3-6.6L2.5 9.4l6.6-.8z" />
          </svg>
        </button>
      ))}
    </div>
  );
  return label ? <Field label={label}>{content}</Field> : content;
}

/* -------------------------------------------------------------- FileUpload */
export function FileUpload({
  label,
  accept = [],
  maxSizeBytes = 5 * 1024 * 1024,
  maxFiles = 5,
}: {
  label?: ReactNode;
  accept?: string[];
  maxSizeBytes?: number;
  maxFiles?: number;
}) {
  const upload = useFileUpload({ accept, maxSizeBytes, maxFiles });
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toDescriptors = (list: FileList | null): FileDescriptor[] =>
    Array.from(list ?? []).map((f) => ({ name: f.name, size: f.size, type: f.type, source: f }));

  return (
    <Field label={label}>
      <div
        className={cx('dropzone', dragging && 'is-dragging')}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          upload.addFiles(toDescriptors(e.dataTransfer.files));
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
      >
        <div className="dropzone__icon">
          <Icon name="upload" size={22} />
        </div>
        <div>
          <strong>Click to upload</strong> or drag and drop
        </div>
        <div className="text-muted text-sm">
          {accept.length ? accept.join(', ') : 'Any file'} · up to {formatBytes(maxSizeBytes)} · max {maxFiles} files
        </div>
        <input
          ref={inputRef}
          type="file"
          hidden
          multiple={maxFiles > 1}
          accept={upload.acceptString}
          onChange={(e) => {
            upload.addFiles(toDescriptors(e.target.files));
            e.target.value = '';
          }}
        />
      </div>
      {upload.rejections.map((r) => (
        <div key={r} className="field__error">
          {r}
        </div>
      ))}
      {upload.files.length > 0 && (
        <ul className="file-list">
          {upload.files.map((f) => (
            <li key={f.id} className="file-list__item">
              <Icon name="file" size={18} />
              <div className="file-list__main">
                <div className="file-list__row">
                  <span className="file-list__name">{f.name}</span>
                  <span className="text-muted text-sm">{formatBytes(f.size)}</span>
                </div>
                {f.status === 'uploading' && <ProgressBar value={f.progress} size="sm" />}
                {f.status === 'done' && <span className="text-success text-sm">Uploaded</span>}
                {f.status === 'error' && <span className="text-danger text-sm">{f.error}</span>}
              </div>
              <IconButton icon="trash" label="Remove" size="sm" onClick={() => upload.remove(f.id)} />
            </li>
          ))}
        </ul>
      )}
      {upload.files.some((f) => f.status === 'pending' || f.status === 'error') && (
        <div className="row gap-sm mt-sm">
          <Button size="sm" leftIcon="upload" loading={upload.isUploading} onClick={upload.uploadAll}>
            Upload
          </Button>
          <Button size="sm" variant="ghost" onClick={upload.clear}>
            Clear
          </Button>
        </div>
      )}
    </Field>
  );
}
