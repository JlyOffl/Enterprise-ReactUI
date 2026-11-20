import { useCallback, useMemo } from 'react';
import { useService } from '../di/DIProvider';
import { TYPES } from '../di/tokens';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { selectPermissions } from '../auth/authSlice';
import { hasPermission } from '../auth/permissions';
import { selectEffectiveFlags } from '../featureFlags/featureFlagsSlice';
import { navLayoutChanged, selectNavLayoutPreference, type NavLayoutPreference } from '../ui/uiSlice';
import type { ModuleRegistry } from '../composable/ModuleRegistry';
import type { PlatformKind } from '../platform/types';
import type { NavItem, NavLayout, NavSection } from './types';

/** Navigation items visible to the current user (permissions + feature flags). */
export function useNavigationItems(): NavItem[] {
  const registry = useService<ModuleRegistry>(TYPES.ModuleRegistry);
  const permissions = useAppSelector(selectPermissions);
  const flags = useAppSelector(selectEffectiveFlags);
  return useMemo(
    () =>
      registry
        .getNavItems()
        .filter((i) => hasPermission(permissions, i.permission) && (!i.featureFlag || flags[i.featureFlag])),
    [registry, permissions, flags],
  );
}

export function useNavigationSections() {
  const items = useNavigationItems();
  return useMemo(() => {
    const order: NavSection[] = ['main', 'framework', 'admin'];
    return order
      .map((section) => ({ section, labelKey: `nav.sections.${section}`, items: items.filter((i) => i.section === section) }))
      .filter((s) => s.items.length);
  }, [items]);
}

/** Every route the user may access (used by routers to build guarded routes). */
export function useAllNavItems(): NavItem[] {
  const registry = useService<ModuleRegistry>(TYPES.ModuleRegistry);
  // stable reference: routers are created from this list
  return useMemo(() => registry.getNavItems(), [registry]);
}

/**
 * Tabs vs Hamburger decision (pure, shared). Explicit preference wins; otherwise:
 * - native: tabs (thumb reachable) unless there are too many primary destinations
 * - web: hamburger/side navigation on narrow viewports or when many destinations, tabs otherwise
 */
export function resolveNavigationLayout({
  preference,
  platform,
  viewportWidth,
  itemCount,
  maxTabs,
}: {
  preference: NavLayoutPreference;
  platform: PlatformKind;
  viewportWidth: number;
  itemCount: number;
  maxTabs: number;
}): NavLayout {
  if (preference !== 'auto') return preference;
  if (platform !== 'web') return 'tabs';
  if (viewportWidth < 768) return 'hamburger';
  return itemCount <= maxTabs + 2 ? 'tabs' : 'hamburger';
}

export function splitNavItems(items: NavItem[], maxTabs: number) {
  const primary = items.filter((i) => i.primary);
  const tabs = (primary.length ? primary : items).slice(0, maxTabs);
  const overflow = items.filter((i) => !tabs.includes(i));
  return { tabs, overflow };
}

export function useNavigationLayout({
  platform,
  viewportWidth,
  maxTabs = 4,
}: {
  platform: PlatformKind;
  viewportWidth: number;
  maxTabs?: number;
}) {
  const preference = useAppSelector(selectNavLayoutPreference);
  const dispatch = useAppDispatch();
  const items = useNavigationItems();
  const layout = resolveNavigationLayout({ preference, platform, viewportWidth, itemCount: items.length, maxTabs });
  const { tabs, overflow } = useMemo(() => splitNavItems(items, maxTabs), [items, maxTabs]);
  const setPreference = useCallback((p: NavLayoutPreference) => dispatch(navLayoutChanged(p)), [dispatch]);
  return { layout, preference, setPreference, items, tabs, overflow };
}
