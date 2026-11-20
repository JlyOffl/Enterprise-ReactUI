import type { Container } from 'inversify';
import type { NavItem } from '../navigation/types';
import type { AppStore } from '../store/store';

export interface ModuleContext {
  container: Container;
  store: AppStore;
}

/**
 * Composable architecture: a vertical feature slice that contributes navigation, state,
 * services and startup work. Platform shells map each `navItems[].id` to a screen component.
 */
export interface FeatureModule {
  id: string;
  /** Whole module can be toggled by a feature flag. */
  featureFlag?: string;
  navItems?: NavItem[];
  /**
   * State: modules own their slices and inject them with `slice.injectInto(rootReducer)`
   * (see features/orders/orderDraftSlice.ts) so the core root reducer never imports them.
   */
  /** IoC registrations owned by the module. */
  register?(container: Container): void;
  /** Runs during application startup (after core services are ready). */
  onInit?(ctx: ModuleContext): void | Promise<void>;
}

export function defineModule(module: FeatureModule): FeatureModule {
  return module;
}
