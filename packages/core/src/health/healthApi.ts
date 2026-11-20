import { baseApi } from '../api/baseApi';
import type { HealthResponse } from '../features/models';

export const healthApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getHealth: build.query<HealthResponse, void>({
      query: () => '/health',
      providesTags: ['Health'],
      // probes must reflect reality, so never retry them
      extraOptions: { noRetry: true },
    }),
  }),
});
