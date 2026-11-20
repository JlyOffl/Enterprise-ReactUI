import type { FeatureModule } from './FeatureModule';
import type { NavItem } from '../navigation/types';

/** Holds the composed feature modules and aggregates their contributions. */
export class ModuleRegistry {
  private readonly modules = new Map<string, FeatureModule>();

  constructor(modules: FeatureModule[] = []) {
    modules.forEach((m) => this.add(m));
  }

  add(module: FeatureModule): void {
    if (this.modules.has(module.id)) throw new Error(`Module "${module.id}" registered twice`);
    this.modules.set(module.id, module);
  }

  list(): FeatureModule[] {
    return [...this.modules.values()];
  }

  get(id: string): FeatureModule | undefined {
    return this.modules.get(id);
  }

  /** Navigation contributed by all modules; module-level flags propagate to their items. */
  getNavItems(): NavItem[] {
    return this.list()
      .flatMap((m) => (m.navItems ?? []).map((item) => ({ ...item, featureFlag: item.featureFlag ?? m.featureFlag })))
      .sort((a, b) => a.order - b.order);
  }
}
