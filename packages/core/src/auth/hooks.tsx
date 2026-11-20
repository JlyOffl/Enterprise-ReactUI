import { useCallback, type ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getErrorMessage } from '../utils/errors';
import { credentialsReceived, loggedOut, selectAuth, selectPermissions } from './authSlice';
import { useLoginMutation, type LoginRequest } from './authApi';
import { hasPermission, type Permission, type PermissionMode } from './permissions';

/** Authentication state + logout. */
export function useAuth() {
  const auth = useAppSelector(selectAuth);
  const dispatch = useAppDispatch();
  const logout = useCallback(() => dispatch(loggedOut()), [dispatch]);
  return {
    ...auth,
    isAuthenticated: auth.status === 'authenticated',
    isRestoring: auth.status === 'idle' || auth.status === 'restoring',
    logout,
  };
}

/** Login command used by both web and mobile login screens. */
export function useLogin() {
  const dispatch = useAppDispatch();
  const [loginMutation, { isLoading, error, reset }] = useLoginMutation();
  const login = useCallback(
    async (request: LoginRequest) => {
      const session = await loginMutation(request).unwrap();
      dispatch(credentialsReceived(session));
      return session;
    },
    [loginMutation, dispatch],
  );
  return { login, isLoading, error: error ? getErrorMessage(error) : null, reset };
}

/** Authorization check against the current user's permissions. */
export function usePermission(required?: Permission | Permission[], mode: PermissionMode = 'all'): boolean {
  const granted = useAppSelector(selectPermissions);
  return hasPermission(granted, required, mode);
}

export interface CanProps {
  permission?: Permission | Permission[];
  mode?: PermissionMode;
  fallback?: ReactNode;
  children: ReactNode;
}

/** Declarative authorization guard. Renders `fallback` when the user lacks permission. */
export function Can({ permission, mode = 'all', fallback = null, children }: CanProps) {
  return <>{usePermission(permission, mode) ? children : fallback}</>;
}
