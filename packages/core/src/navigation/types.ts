import type { Permission } from '../auth/permissions';

/** Platform neutral icon names; web maps to lucide-react, mobile to Ionicons. */
export type IconName =
  | 'home'
  | 'grid'
  | 'form'
  | 'layers'
  | 'users'
  | 'cart'
  | 'window'
  | 'flag'
  | 'activity'
  | 'link'
  | 'settings'
  | 'logout'
  | 'menu'
  | 'more';

export type NavSection = 'main' | 'framework' | 'admin';

export interface NavItem {
  /** Route id; platforms map it to a page/screen component. */
  id: string;
  path: string;
  labelKey: string;
  icon: IconName;
  section: NavSection;
  order: number;
  permission?: Permission;
  featureFlag?: string;
  /** Candidate for the primary tab bar. */
  primary?: boolean;
}

export type NavLayout = 'tabs' | 'hamburger';
