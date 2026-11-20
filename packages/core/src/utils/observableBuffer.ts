import { useSyncExternalStore } from 'react';

/**
 * A tiny ring buffer that React can subscribe to (useSyncExternalStore).
 * Used for in-memory logs, analytics events and the Dynatrace outbox.
 */
export interface ObservableBuffer<T> {
  push(item: T): void;
  getSnapshot(): readonly T[];
  subscribe(listener: () => void): () => void;
  clear(): void;
}

export function createObservableBuffer<T>(capacity = 200): ObservableBuffer<T> {
  let items: readonly T[] = [];
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((l) => l());
  return {
    push(item) {
      items = [item, ...items].slice(0, capacity);
      emit();
    },
    getSnapshot: () => items,
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    clear() {
      items = [];
      emit();
    },
  };
}

export function useObservableBuffer<T>(buffer: ObservableBuffer<T>): readonly T[] {
  return useSyncExternalStore(buffer.subscribe, buffer.getSnapshot, buffer.getSnapshot);
}
