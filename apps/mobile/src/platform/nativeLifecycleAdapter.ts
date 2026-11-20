import { AppState, type AppStateStatus } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import type { AppVisibility, PlatformLifecycleAdapter } from '@erui/core';

const toVisibility = (s: AppStateStatus): AppVisibility => (s === 'active' ? 'foreground' : 'background');

type GlobalHandler = (error: unknown, isFatal?: boolean) => void;
interface ErrorUtilsShape {
  getGlobalHandler(): GlobalHandler;
  setGlobalHandler(handler: GlobalHandler): void;
}

let lastOnline = true;

/** Application lifecycle - Mobile: AppState, NetInfo and the RN global error handler. */
export const nativeLifecycleAdapter: PlatformLifecycleAdapter = {
  getInitialVisibility: () => toVisibility(AppState.currentState),
  getInitialOnline: () => lastOnline,

  subscribeVisibility(callback) {
    const sub = AppState.addEventListener('change', (s) => {
      // ignore iOS 'inactive' transitions (control center, app switcher peeks)
      if (s !== 'inactive') callback(toVisibility(s));
    });
    return () => sub.remove();
  },

  subscribeConnectivity(callback) {
    return NetInfo.addEventListener((state) => {
      const online = state.isConnected !== false && state.isInternetReachable !== false;
      if (online !== lastOnline) {
        lastOnline = online;
        callback(online);
      }
    });
  },

  subscribeGlobalErrors(callback) {
    const errorUtils = (globalThis as { ErrorUtils?: ErrorUtilsShape }).ErrorUtils;
    if (!errorUtils) return () => undefined;
    const previous = errorUtils.getGlobalHandler();
    errorUtils.setGlobalHandler((error, isFatal) => {
      callback(error, !!isFatal);
      previous(error, isFatal);
    });
    return () => errorUtils.setGlobalHandler(previous);
  },
};
