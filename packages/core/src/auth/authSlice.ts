import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Permission, Role } from './permissions';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  title: string;
  department: string;
  roles: Role[];
  permissions: Permission[];
  avatarUrl?: string;
  externalIds: Record<string, string>;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: number;
}

export type AuthStatus = 'idle' | 'restoring' | 'authenticated' | 'anonymous';

export interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  token: string | null;
  expiresAt: number | null;
  lastError: string | null;
}

const NO_PERMISSIONS: Permission[] = [];

const initialState: AuthState = {
  status: 'idle',
  user: null,
  token: null,
  expiresAt: null,
  lastError: null,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionRestoreStarted(state) {
      state.status = 'restoring';
    },
    credentialsReceived(state, action: PayloadAction<AuthSession & { restored?: boolean }>) {
      state.status = 'authenticated';
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.expiresAt = action.payload.expiresAt;
      state.lastError = null;
    },
    markedAnonymous(state) {
      state.status = 'anonymous';
    },
    loggedOut: {
      reducer(state) {
        Object.assign(state, initialState, { status: 'anonymous' });
      },
      prepare: () => ({ payload: undefined, meta: { analytics: { event: 'auth.logout' } } }),
    },
    sessionExpired(state) {
      Object.assign(state, initialState, { status: 'anonymous', lastError: 'auth.sessionExpired' });
    },
  },
  selectors: {
    selectAuth: (s) => s,
    selectUser: (s) => s.user,
    selectToken: (s) => s.token,
    selectAuthStatus: (s) => s.status,
    selectIsAuthenticated: (s) => s.status === 'authenticated',
    selectPermissions: (s): Permission[] => s.user?.permissions ?? NO_PERMISSIONS,
  },
});

export const { sessionRestoreStarted, credentialsReceived, markedAnonymous, loggedOut, sessionExpired } =
  authSlice.actions;
export const {
  selectAuth,
  selectUser,
  selectToken,
  selectAuthStatus,
  selectIsAuthenticated,
  selectPermissions,
} = authSlice.selectors;
