import { useCallback, useMemo, type ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useService } from '../di/DIProvider';
import { TYPES } from '../di/tokens';
import { baseApi } from '../api/baseApi';
import {
  flagOverrideCleared,
  flagOverridden,
  flagOverridesReset,
  flagsLoaded,
  selectFeatureFlags,
  selectFlag,
} from './featureFlagsSlice';
import type { FeatureFlagService } from './FeatureFlagService';
import type { FlagKey } from './definitions';
import { selectUser } from '../auth/authSlice';

export const flagsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getFeatureFlags: build.query<Record<string, boolean>, void>({
      query: () => '/feature-flags',
      providesTags: ['Flags'],
    }),
  }),
});

export function useFeatureFlag(key: FlagKey): boolean {
  return useAppSelector((state) => selectFlag(state, key));
}

export interface FeatureProps {
  flag: FlagKey;
  /** Render when the flag is OFF (defaults to nothing). */
  fallback?: ReactNode;
  children: ReactNode;
}

/** Declarative feature toggle. */
export function Feature({ flag, fallback = null, children }: FeatureProps) {
  return <>{useFeatureFlag(flag) ? children : fallback}</>;
}

/** Admin view of all flags: definitions, effective value, source, overrides. */
export function useFeatureFlagAdmin() {
  const dispatch = useAppDispatch();
  const state = useAppSelector(selectFeatureFlags);
  const user = useAppSelector(selectUser);
  const service = useService<FeatureFlagService>(TYPES.FeatureFlagService);

  const flags = useMemo(
    () =>
      service.definitions.map((d) => {
        const overridden = d.key in state.overrides;
        return {
          ...d,
          remoteValue: state.values[d.key] ?? d.defaultValue,
          value: overridden ? state.overrides[d.key]! : (state.values[d.key] ?? d.defaultValue),
          overridden,
        };
      }),
    [service, state],
  );

  const refresh = useCallback(async () => {
    const result = await service.load({ userId: user?.id, roles: user?.roles });
    dispatch(flagsLoaded(result));
  }, [service, user, dispatch]);

  return {
    flags,
    status: state.status,
    source: state.source,
    lastLoadedAt: state.lastLoadedAt,
    overrideCount: Object.keys(state.overrides).length,
    setOverride: (key: string, value: boolean) => dispatch(flagOverridden({ key, value })),
    clearOverride: (key: string) => dispatch(flagOverrideCleared(key)),
    resetOverrides: () => dispatch(flagOverridesReset()),
    refresh,
  };
}
