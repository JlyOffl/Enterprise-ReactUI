import { useCallback, useEffect, useRef, useState } from 'react';

type SetStateArg<T> = T | ((prev: T) => T);

/** Supports both controlled (`value`) and uncontrolled (`defaultValue`) usage. */
export function useControllableState<T>({
  value,
  defaultValue,
  onChange,
}: {
  value?: T;
  defaultValue: T;
  onChange?: (value: T) => void;
}): [T, (next: SetStateArg<T>) => void] {
  const [internal, setInternal] = useState<T>(defaultValue);
  const controlled = value !== undefined;
  const current = controlled ? (value as T) : internal;
  const currentRef = useRef(current);
  currentRef.current = current;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const setValue = useCallback(
    (next: SetStateArg<T>) => {
      const resolved = typeof next === 'function' ? (next as (p: T) => T)(currentRef.current) : next;
      if (Object.is(resolved, currentRef.current)) return;
      if (!controlled) setInternal(resolved);
      onChangeRef.current?.(resolved);
    },
    [controlled],
  );
  return [current, setValue];
}

/** Open/close state for dialogs, popovers, menus, drawers... */
export function useDisclosure(initial = false, callbacks?: { onOpen?: () => void; onClose?: () => void }) {
  const [isOpen, setIsOpen] = useState(initial);
  const cb = useRef(callbacks);
  cb.current = callbacks;
  const open = useCallback(() => {
    setIsOpen(true);
    cb.current?.onOpen?.();
  }, []);
  const close = useCallback(() => {
    setIsOpen(false);
    cb.current?.onClose?.();
  }, []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  return { isOpen, open, close, toggle, setIsOpen };
}

export function useToggle(initial = false): [boolean, () => void, (v: boolean) => void] {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue((v) => !v), []);
  return [value, toggle, setValue];
}

export function useDebouncedValue<T>(value: T, delayMs = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

/** Numeric stepper with bounds (quantity inputs). */
export function useCounter({
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
  step = 1,
  value,
  defaultValue = 0,
  onChange,
}: {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  defaultValue?: number;
  onChange?: (v: number) => void;
} = {}) {
  const [count, setCount] = useControllableState({ value, defaultValue, onChange });
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  return {
    value: count,
    set: (v: number) => setCount(clamp(v)),
    increment: () => setCount((c) => clamp(c + step)),
    decrement: () => setCount((c) => clamp(c - step)),
    canIncrement: count + step <= max,
    canDecrement: count - step >= min,
  };
}
