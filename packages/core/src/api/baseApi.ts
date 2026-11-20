import { createApi } from '@reduxjs/toolkit/query/react';
import { enterpriseBaseQuery } from './baseQuery';

/**
 * Single RTK Query API. Feature modules extend it with `baseApi.injectEndpoints(...)`
 * so the API surface grows with the composed modules (code-split friendly).
 */
export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: enterpriseBaseQuery,
  tagTypes: ['User', 'Order', 'Product', 'Dashboard', 'Health', 'Flags'],
  keepUnusedDataFor: 60,
  endpoints: () => ({}),
});
