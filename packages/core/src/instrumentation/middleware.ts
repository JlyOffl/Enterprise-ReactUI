import { isRejectedWithValue, isRejected, type Middleware, type UnknownAction } from '@reduxjs/toolkit';
import type { AnalyticsService } from './AnalyticsService';
import type { Logger } from '../logging/Logger';

interface AnalyticsMeta {
  analytics?: { event: string; properties?: Record<string, string | number | boolean> };
}

/**
 * Tracks Redux actions that opt-in via `meta.analytics`, plus every RTK Query mutation outcome.
 * Keeps instrumentation out of components and business logic.
 */
export function createAnalyticsMiddleware(analytics: AnalyticsService): Middleware {
  return () => (next) => (action) => {
    const result = next(action);
    const a = action as UnknownAction & { meta?: AnalyticsMeta & { arg?: { type?: string; endpointName?: string } } };
    if (a.meta?.analytics) {
      analytics.track(a.meta.analytics.event, a.meta.analytics.properties);
    } else if (a.meta?.arg?.type === 'mutation' && typeof a.type === 'string') {
      const status = a.type.endsWith('/fulfilled') ? 'success' : a.type.endsWith('/rejected') ? 'failure' : null;
      if (status) analytics.track(`api.mutation.${a.meta.arg.endpointName}`, { status });
    }
    return result;
  };
}

/** Logs every rejected async thunk / API call centrally. */
export function createErrorLoggingMiddleware(logger: Logger): Middleware {
  const log = logger.child('redux');
  return () => (next) => (action) => {
    if (isRejectedWithValue(action)) {
      const payload = action.payload as { status?: unknown; data?: { message?: string } } | undefined;
      log.warn('Rejected action', {
        type: action.type,
        status: String(payload?.status ?? ''),
        message: payload?.data?.message,
      });
    } else if (isRejected(action) && action.error?.name !== 'ConditionError' && action.error?.name !== 'AbortError') {
      log.error(`Unhandled rejection in ${action.type}`, action.error);
    }
    return next(action);
  };
}
