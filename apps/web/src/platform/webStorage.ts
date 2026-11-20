import { createMemoryStorage, type KeyValueStorage } from '@erui/core';

function fromWebStorage(getStore: () => Storage): KeyValueStorage {
  try {
    const store = getStore();
    const probe = '__erui_probe__';
    store.setItem(probe, '1');
    store.removeItem(probe);
    return {
      getItem: async (k) => store.getItem(k),
      setItem: async (k, v) => store.setItem(k, v),
      removeItem: async (k) => store.removeItem(k),
    };
  } catch {
    // private mode / disabled storage
    return createMemoryStorage();
  }
}

/** Preferences: localStorage. */
export const webStorage = fromWebStorage(() => window.localStorage);

/**
 * Session tokens: sessionStorage (cleared with the tab). In production prefer httpOnly
 * cookies issued by a BFF so tokens are never exposed to script.
 */
export const webSecureStorage = fromWebStorage(() => window.sessionStorage);
