import {
  fetchBaseQuery,
  retry,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import type { Container } from 'inversify';
import { TYPES } from '../di/tokens';
import { createCorrelationId, now } from '../utils/id';
import type { AppConfig } from '../config/appConfig';
import type { Logger } from '../logging/Logger';
import type { DynatraceBridge } from '../dynatrace/types';
import type { ExternalSystemService } from '../externalSystem/ExternalSystemService';
import { sessionExpired } from '../auth/authSlice';
import { handleMockRequest } from './mock/mockServer';

/** Injected into thunks, listeners and the base query: the IoC container. */
export interface ThunkExtra {
  container: Container;
}

export interface ApiExtraOptions {
  /** Disable automatic retries (e.g. health probes). */
  noRetry?: boolean;
}

export interface ApiMeta {
  correlationId: string;
  durationMs: number;
  status?: number;
}

const fetchers = new Map<string, ReturnType<typeof fetchBaseQuery>>();

/**
 * Enterprise base query:
 * - Authorization bearer token from the auth slice
 * - X-External-System-Id / X-Correlation-Id / Accept-Language headers
 * - Dynatrace action per request + structured logging with timings
 * - Central 401 handling (session expiry)
 * - Mock backend or real fetch, selected by config
 */
const rawBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, ApiExtraOptions, ApiMeta> = async (
  args,
  api,
) => {
  const { container } = api.extra as ThunkExtra;
  const config = container.get<AppConfig>(TYPES.Config);
  const logger = container.get<Logger>(TYPES.Logger).child('api');
  const externalSystems = container.get<ExternalSystemService>(TYPES.ExternalSystemService);
  const dynatrace = container.get<DynatraceBridge>(TYPES.DynatraceBridge);

  const state = api.getState() as { auth?: { token: string | null }; ui?: { locale?: string } };
  const request: FetchArgs = typeof args === 'string' ? { url: args } : args;
  const method = (request.method ?? 'GET').toUpperCase();
  const route = request.url.split('?')[0]!;
  const correlationId = createCorrelationId();
  const headers: Record<string, string> = {
    ...externalSystems.buildRequestHeaders(correlationId),
    'Accept-Language': state.ui?.locale ?? config.defaultLocale,
  };
  if (state.auth?.token) headers.Authorization = `Bearer ${state.auth.token}`;

  const action = dynatrace.enterAction(`API ${method} ${route}`);
  action.reportValue('correlationId', correlationId);
  const start = now();

  let data: unknown;
  let error: FetchBaseQueryError | undefined;
  let status: number | undefined;

  try {
    if (config.useMockApi) {
      const res = await handleMockRequest({ url: request.url, method, body: request.body, params: request.params, headers });
      if ('error' in res) error = res.error;
      else {
        data = res.data;
        status = res.meta?.status;
      }
    } else {
      let fetcher = fetchers.get(config.apiBaseUrl);
      if (!fetcher) {
        fetcher = fetchBaseQuery({ baseUrl: config.apiBaseUrl, timeout: config.requestTimeoutMs });
        fetchers.set(config.apiBaseUrl, fetcher);
      }
      const res = await fetcher(
        { ...request, headers: { ...(request.headers as Record<string, string> | undefined), ...headers } },
        api,
        {},
      );
      status = res.meta?.response?.status;
      if (res.error) error = res.error;
      else data = res.data;
    }
  } catch (e) {
    error = { status: 'FETCH_ERROR', error: e instanceof Error ? e.message : String(e) };
  }

  const durationMs = Math.round(now() - start);
  action.reportValue('durationMs', durationMs);

  if (error) {
    const errStatus = typeof error.status === 'number' ? error.status : 0;
    action.reportError(`HTTP ${String(error.status)}`, errStatus);
    logger.warn(`${method} ${route} failed`, { status: String(error.status), durationMs, correlationId });
    if (error.status === 401 && route !== '/auth/login' && state.auth?.token) api.dispatch(sessionExpired());
    action.leave();
    return { error, meta: { correlationId, durationMs, status: errStatus } };
  }

  logger.debug(`${method} ${route} ${status ?? 200}`, { durationMs, correlationId });
  action.leave();
  return { data, meta: { correlationId, durationMs, status } };
};

/** Retries network failures and 5xx responses with exponential backoff (max 2 retries). */
export const enterpriseBaseQuery = retry(rawBaseQuery, {
  retryCondition: (error, _args, { attempt, extraOptions }) => {
    if ((extraOptions as ApiExtraOptions | undefined)?.noRetry || attempt > 2) return false;
    const status = (error as FetchBaseQueryError).status;
    return status === 'FETCH_ERROR' || status === 'TIMEOUT_ERROR' || (typeof status === 'number' && status >= 500);
  },
});
