import {
  createListenerMiddleware,
  isAnyOf,
  type ThunkDispatch,
  type UnknownAction,
} from '@reduxjs/toolkit';
import { TYPES } from '../di/tokens';
import type { ThunkExtra } from '../api/baseQuery';
import { baseApi } from '../api/baseApi';
import type { RootState } from './rootReducer';
import { credentialsReceived, loggedOut, sessionExpired } from '../auth/authSlice';
import type { AuthService } from '../auth/AuthService';
import type { AnalyticsService } from '../instrumentation/AnalyticsService';
import type { DynatraceBridge } from '../dynatrace/types';
import type { Logger } from '../logging/Logger';
import type { PreferencesService } from '../preferences/PreferencesService';
import type { FeatureFlagService } from '../featureFlags/FeatureFlagService';
import { accentChanged, themeModeChanged } from '../theme/themeSlice';
import { densityChanged, localeChanged, navLayoutChanged } from '../ui/uiSlice';
import { flagOverrideCleared, flagOverridden, flagOverridesReset, flagsLoaded } from '../featureFlags/featureFlagsSlice';
import { alertRaised } from '../health/healthSlice';
import { toastAdded } from '../notifications/toastSlice';
import { allModalsClosed } from '../modal/modalSlice';
import { preferencesReset } from './actions';

export type AppThunkDispatch = ThunkDispatch<RootState, ThunkExtra, UnknownAction>;

export const listenerMiddleware = (extra: ThunkExtra) =>
  createListenerMiddleware<RootState, AppThunkDispatch, ThunkExtra>({ extra });

/**
 * Cross-cutting side effects (kept out of components and reducers):
 * session persistence, identity propagation to analytics/Dynatrace, preference persistence,
 * alert -> toast routing, flag re-evaluation on login.
 */
export function registerListeners(listener: ReturnType<typeof listenerMiddleware>) {
  const start = listener.startListening;

  start({
    actionCreator: credentialsReceived,
    effect: async (action, api) => {
      const { container } = api.extra;
      const auth = container.get<AuthService>(TYPES.AuthService);
      const analytics = container.get<AnalyticsService>(TYPES.AnalyticsService);
      const flags = container.get<FeatureFlagService>(TYPES.FeatureFlagService);
      const { user } = action.payload;
      await auth.persistSession(action.payload);
      analytics.identify(user.id, { role: user.roles.join(','), department: user.department });
      container.get<Logger>(TYPES.Logger).info(action.payload.restored ? 'Session restored' : 'User signed in', {
        userId: user.id,
      });
      api.dispatch(flagsLoaded(await flags.load({ userId: user.id, roles: user.roles })));
    },
  });

  start({
    matcher: isAnyOf(loggedOut, sessionExpired),
    effect: async (action, api) => {
      const { container } = api.extra;
      await container.get<AuthService>(TYPES.AuthService).clearSession();
      container.get<AnalyticsService>(TYPES.AnalyticsService).identify(null);
      container.get<DynatraceBridge>(TYPES.DynatraceBridge).endSession();
      api.dispatch(baseApi.util.resetApiState());
      api.dispatch(allModalsClosed());
      if (sessionExpired.match(action)) {
        api.dispatch(toastAdded({ variant: 'warning', title: 'auth.sessionExpired' }));
      }
    },
  });

  // Persist preferences (debounced).
  start({
    matcher: isAnyOf(
      themeModeChanged,
      accentChanged,
      localeChanged,
      navLayoutChanged,
      densityChanged,
      flagOverridden,
      flagOverrideCleared,
      flagOverridesReset,
      preferencesReset,
    ),
    effect: async (_action, api) => {
      api.cancelActiveListeners();
      await api.delay(300);
      const state = api.getState();
      await api.extra.container.get<PreferencesService>(TYPES.PreferencesService).save({
        themeMode: state.theme.mode,
        accent: state.theme.accent,
        locale: state.ui.locale,
        navLayout: state.ui.navLayout,
        density: state.ui.density,
        flagOverrides: state.featureFlags.overrides,
      });
    },
  });

  start({
    actionCreator: alertRaised,
    effect: (action, api) => {
      const { severity, title, message } = action.payload;
      api.dispatch(
        toastAdded({
          variant: severity === 'critical' ? 'error' : severity === 'warning' ? 'warning' : 'success',
          title,
          message,
        }),
      );
    },
  });
}
