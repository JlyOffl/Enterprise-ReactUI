import { useCallback, useMemo, useRef, useState } from 'react';
import { useControllableState } from './state';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  group?: string;
}

function nextEnabled(options: SelectOption[], from: number, delta: number): number {
  if (!options.length) return -1;
  let i = from;
  for (let n = 0; n < options.length; n++) {
    i = (i + delta + options.length) % options.length;
    if (!options[i]!.disabled) return i;
  }
  return from;
}

/* ---------------------------------------------------------------- Select */
export function useSelect({
  options,
  value,
  defaultValue = '',
  onChange,
}: {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}) {
  const [selected, setSelected] = useControllableState({ value, defaultValue, onChange });
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const typeahead = useRef({ text: '', at: 0 });

  const open = useCallback(() => {
    setIsOpen(true);
    setHighlightedIndex(Math.max(0, options.findIndex((o) => o.value === selected)));
  }, [options, selected]);
  const close = useCallback(() => setIsOpen(false), []);
  const select = (v: string) => {
    if (options.find((o) => o.value === v)?.disabled) return;
    setSelected(v);
    setIsOpen(false);
  };

  const handleKey = (key: string): boolean => {
    if (!isOpen) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(key)) {
        open();
        return true;
      }
      return false;
    }
    switch (key) {
      case 'ArrowDown':
        setHighlightedIndex((i) => nextEnabled(options, i, 1));
        return true;
      case 'ArrowUp':
        setHighlightedIndex((i) => nextEnabled(options, i, -1));
        return true;
      case 'Home':
        setHighlightedIndex(nextEnabled(options, -1, 1));
        return true;
      case 'End':
        setHighlightedIndex(nextEnabled(options, options.length, -1));
        return true;
      case 'Enter':
      case ' ':
        if (options[highlightedIndex]) select(options[highlightedIndex]!.value);
        return true;
      case 'Escape':
      case 'Tab':
        close();
        return key === 'Escape';
      default:
        if (key.length === 1) {
          const t = typeahead.current;
          t.text = Date.now() - t.at > 600 ? key.toLowerCase() : t.text + key.toLowerCase();
          t.at = Date.now();
          const i = options.findIndex((o) => !o.disabled && o.label.toLowerCase().startsWith(t.text));
          if (i >= 0) setHighlightedIndex(i);
          return true;
        }
        return false;
    }
  };

  return {
    isOpen,
    open,
    close,
    toggle: () => (isOpen ? close() : open()),
    selected,
    selectedOption: options.find((o) => o.value === selected),
    select,
    highlightedIndex,
    setHighlightedIndex,
    handleKey,
  };
}

/* -------------------------------------------------------------- Combobox */
export function defaultFilter(option: SelectOption, query: string) {
  const q = query.trim().toLowerCase();
  return !q || option.label.toLowerCase().includes(q) || option.description?.toLowerCase().includes(q) === true;
}

export function useCombobox({
  options,
  value,
  defaultValue = '',
  onChange,
  filter = defaultFilter,
  maxResults = 50,
}: {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  filter?: (option: SelectOption, query: string) => boolean;
  maxResults?: number;
}) {
  const [selected, setSelected] = useControllableState({ value, defaultValue, onChange });
  const selectedOption = options.find((o) => o.value === selected);
  const [query, setQueryState] = useState(selectedOption?.label ?? '');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [dirty, setDirty] = useState(false);

  const filtered = useMemo(
    () => (dirty ? options.filter((o) => filter(o, query)) : options).slice(0, maxResults),
    [options, query, filter, dirty, maxResults],
  );

  const select = (option: SelectOption) => {
    if (option.disabled) return;
    setSelected(option.value);
    setQueryState(option.label);
    setDirty(false);
    setIsOpen(false);
  };

  return {
    query,
    setQuery: (q: string) => {
      setQueryState(q);
      setDirty(true);
      setIsOpen(true);
      setHighlightedIndex(0);
    },
    filtered,
    isOpen,
    open: () => setIsOpen(true),
    close: () => {
      setIsOpen(false);
      setDirty(false);
      setQueryState(selectedOption?.label ?? '');
    },
    selected,
    selectedOption,
    select,
    clear: () => {
      setSelected('');
      setQueryState('');
      setDirty(false);
    },
    highlightedIndex,
    setHighlightedIndex,
    handleKey: (key: string): boolean => {
      if (key === 'ArrowDown') {
        setIsOpen(true);
        setHighlightedIndex((i) => Math.min(filtered.length - 1, i + 1));
        return true;
      }
      if (key === 'ArrowUp') {
        setHighlightedIndex((i) => Math.max(0, i - 1));
        return true;
      }
      if (key === 'Enter' && isOpen && filtered[highlightedIndex]) {
        select(filtered[highlightedIndex]!);
        return true;
      }
      if (key === 'Escape') {
        setIsOpen(false);
        return true;
      }
      return false;
    },
  };
}

/* --------------------------------------------------- Multi select / tags */
export function useMultiSelect({
  value,
  defaultValue = [],
  onChange,
  allowCustom = false,
  max,
}: {
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  allowCustom?: boolean;
  max?: number;
}) {
  const [values, setValues] = useControllableState<string[]>({ value, defaultValue, onChange });
  const [inputValue, setInputValue] = useState('');
  const add = (v: string) => {
    const trimmed = v.trim();
    if (!trimmed || values.includes(trimmed) || (max && values.length >= max)) return;
    setValues([...values, trimmed]);
    setInputValue('');
  };
  const remove = (v: string) => setValues(values.filter((x) => x !== v));
  return {
    values,
    has: (v: string) => values.includes(v),
    add,
    remove,
    toggle: (v: string) => (values.includes(v) ? remove(v) : add(v)),
    clear: () => setValues([]),
    inputValue,
    setInputValue,
    handleKey: (key: string): boolean => {
      if ((key === 'Enter' || key === ',') && allowCustom && inputValue.trim()) {
        add(inputValue);
        return true;
      }
      if (key === 'Backspace' && !inputValue && values.length) {
        remove(values[values.length - 1]!);
        return true;
      }
      return false;
    },
  };
}
