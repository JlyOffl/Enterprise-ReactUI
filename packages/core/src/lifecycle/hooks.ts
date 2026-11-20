import { useEffect, useRef } from 'react';
import { useService } from '../di/DIProvider';
import { TYPES } from '../di/tokens';
import { useAppSelector } from '../store/hooks';
import { selectAppState } from './appSlice';
import type { LifecycleService } from './LifecycleService';

/** Current lifecycle snapshot: phase, visibility, connectivity, startup timings. */
export function useAppLifecycle() {
  return useAppSelector(selectAppState);
}

export function useOnForeground(callback: () => void) {
  const lifecycle = useService<LifecycleService>(TYPES.LifecycleService);
  const ref = useRef(callback);
  ref.current = callback;
  useEffect(() => lifecycle.onForeground(() => ref.current()), [lifecycle]);
}

export function useOnBackground(callback: () => void) {
  const lifecycle = useService<LifecycleService>(TYPES.LifecycleService);
  const ref = useRef(callback);
  ref.current = callback;
  useEffect(() => lifecycle.onBackground(() => ref.current()), [lifecycle]);
}
