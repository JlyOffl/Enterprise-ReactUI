import { combineSlices } from '@reduxjs/toolkit';
import { authSlice } from '../auth/authSlice';
import { appSlice } from '../lifecycle/appSlice';
import { uiSlice } from '../ui/uiSlice';
import { themeSlice } from '../theme/themeSlice';
import { featureFlagsSlice } from '../featureFlags/featureFlagsSlice';
import { healthSlice } from '../health/healthSlice';
import { modalSlice } from '../modal/modalSlice';
import { toastSlice } from '../notifications/toastSlice';
import { baseApi } from '../api/baseApi';

/**
 * Slices that feature modules inject at runtime (composable architecture).
 * Modules extend this interface through declaration merging.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LazyLoadedSlices {}

export const rootReducer = combineSlices(
  authSlice,
  appSlice,
  uiSlice,
  themeSlice,
  featureFlagsSlice,
  healthSlice,
  modalSlice,
  toastSlice,
  baseApi,
).withLazyLoadedSlices<LazyLoadedSlices>();

export type RootState = ReturnType<typeof rootReducer>;
