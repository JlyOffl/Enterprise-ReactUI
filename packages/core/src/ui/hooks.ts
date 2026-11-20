import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useService } from '../di/DIProvider';
import { TYPES } from '../di/tokens';
import { preferencesReset } from '../store/actions';
import { densityChanged, mobileNavToggled, selectUi, sidebarToggled, type Density } from './uiSlice';
import { useTheme } from '../theme/hooks';
import { useLocale } from '../i18n/hooks';
import { useNavigationLayout } from '../navigation/hooks';
import { useFeatureFlag } from '../featureFlags/hooks';
import { FLAGS } from '../featureFlags/definitions';
import type { AppConfig } from '../config/appConfig';
import type { PlatformServices } from '../platform/types';

export function useShellState() {
  const ui = useAppSelector(selectUi);
  const dispatch = useAppDispatch();
  return {
    ...ui,
    toggleSidebar: useCallback((v?: boolean) => dispatch(sidebarToggled(v)), [dispatch]),
    toggleMobileNav: useCallback((v?: boolean) => dispatch(mobileNavToggled(v)), [dispatch]),
  };
}

/** Settings screen logic: theme, accent, locale, navigation layout, density, about. */
export function useSettings(viewportWidth: number) {
  const theme = useTheme();
  const locale = useLocale();
  const ui = useAppSelector(selectUi);
  const dispatch = useAppDispatch();
  const config = useService<AppConfig>(TYPES.Config);
  const platform = useService<PlatformServices>(TYPES.Platform);
  const nav = useNavigationLayout({ platform: platform.kind, viewportWidth });
  const densityToggleEnabled = useFeatureFlag(FLAGS.compactDensity);

  return {
    theme,
    locale,
    nav,
    density: ui.density,
    densityToggleEnabled,
    setDensity: (d: Density) => dispatch(densityChanged(d)),
    resetPreferences: () => dispatch(preferencesReset()),
    about: {
      appName: config.appName,
      version: config.version,
      environment: config.environment,
      platform: platform.kind,
      device: platform.getDeviceInfo(),
      mockApi: config.useMockApi,
      externalSystemId: config.externalSystemId,
    },
  };
}
