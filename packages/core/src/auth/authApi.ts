import { baseApi } from '../api/baseApi';
import type { AuthSession, AuthUser } from './authSlice';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthSession, LoginRequest>({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    me: build.query<AuthUser, void>({
      query: () => '/auth/me',
    }),
  }),
});

export const { useLoginMutation, useMeQuery } = authApi;
