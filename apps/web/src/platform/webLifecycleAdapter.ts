import type { AppVisibility, PlatformLifecycleAdapter } from '@erui/core';

const visibility = (): AppVisibility => (document.visibilityState === 'hidden' ? 'background' : 'foreground');

/** Application lifecycle - Web: Page Visibility API, online/offline, global errors, unload. */
export const webLifecycleAdapter: PlatformLifecycleAdapter = {
  getInitialVisibility: visibility,
  getInitialOnline: () => navigator.onLine,

  subscribeVisibility(callback) {
    const handler = () => callback(visibility());
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  },

  subscribeConnectivity(callback) {
    const on = () => callback(true);
    const off = () => callback(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  },

  subscribeGlobalErrors(callback) {
    const onError = (e: ErrorEvent) => callback(e.error ?? e.message, false);
    const onRejection = (e: PromiseRejectionEvent) => callback(e.reason, false);
    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onRejection);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onRejection);
    };
  },

  subscribeBeforeExit(callback) {
    window.addEventListener('pagehide', callback);
    return () => window.removeEventListener('pagehide', callback);
  },
};
