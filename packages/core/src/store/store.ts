import { configureStore } from '@reduxjs/toolkit';
import type { Container } from 'inversify';
import { TYPES } from '../di/tokens';
import { baseApi } from '../api/baseApi';
import type { AppConfig } from '../config/appConfig';
import type { AnalyticsService } from '../instrumentation/AnalyticsService';
import type { Logger } from '../logging/Logger';
import { createAnalyticsMiddleware, createErrorLoggingMiddleware } from '../instrumentation/middleware';
import { rootReducer } from './rootReducer';
import { listenerMiddleware, registerListeners } from './listeners';

/** Redux store wired with the IoC container as thunk/listener extra argument. */
export function createAppStore(container: Container) {
  const config = container.get<AppConfig>(TYPES.Config);
  const analytics = container.get<AnalyticsService>(TYPES.AnalyticsService);
  const logger = container.get<Logger>(TYPES.Logger);

  const listener = listenerMiddleware({ container });
  registerListeners(listener);

  return configureStore({
    reducer: rootReducer,
    devTools: config.environment !== 'production',
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: { extraArgument: { container } },
        // the container is passed through `extra`, never stored in state
        serializableCheck: { warnAfter: 128 },
        immutableCheck: { warnAfter: 128 },
      })
        .prepend(listener.middleware)
        .concat(baseApi.middleware, createAnalyticsMiddleware(analytics), createErrorLoggingMiddleware(logger)),
  });
}

export type AppStore = ReturnType<typeof createAppStore>;
export type AppDispatch = AppStore['dispatch'];
