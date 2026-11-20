import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import type { IconName } from '@erui/core';
import { useTheme } from '@erui/core';

type IonName = ComponentProps<typeof Ionicons>['name'];

const ICONS = {
  home: 'home-outline',
  grid: 'grid-outline',
  form: 'document-text-outline',
  layers: 'layers-outline',
  users: 'people-outline',
  cart: 'cart-outline',
  window: 'browsers-outline',
  flag: 'flag-outline',
  activity: 'pulse-outline',
  link: 'link-outline',
  settings: 'settings-outline',
  logout: 'log-out-outline',
  menu: 'menu-outline',
  more: 'ellipsis-horizontal',
  check: 'checkmark',
  x: 'close',
  chevronDown: 'chevron-down',
  chevronUp: 'chevron-up',
  chevronLeft: 'chevron-back',
  chevronRight: 'chevron-forward',
  search: 'search',
  plus: 'add',
  minus: 'remove',
  trash: 'trash-outline',
  edit: 'create-outline',
  upload: 'cloud-upload-outline',
  file: 'document-outline',
  folder: 'folder-outline',
  star: 'star',
  calendar: 'calendar-outline',
  bell: 'notifications-outline',
  info: 'information-circle-outline',
  warning: 'warning-outline',
  error: 'alert-circle-outline',
  success: 'checkmark-circle-outline',
  sun: 'sunny-outline',
  moon: 'moon-outline',
  monitor: 'phone-portrait-outline',
  globe: 'globe-outline',
  eye: 'eye-outline',
  eyeOff: 'eye-off-outline',
  copy: 'copy-outline',
  refresh: 'refresh',
  filter: 'filter-outline',
  sort: 'swap-vertical',
  sortAsc: 'arrow-up',
  sortDesc: 'arrow-down',
  user: 'person-outline',
  shield: 'shield-checkmark-outline',
  send: 'send-outline',
  zap: 'flash-outline',
  clock: 'time-outline',
  trendUp: 'trending-up',
  trendDown: 'trending-down',
  grip: 'reorder-two',
  minimize: 'remove-outline',
  maximize: 'expand-outline',
  save: 'save-outline',
  panel: 'albums-outline',
  dot: 'ellipse',
} satisfies Record<IconName | string, IonName>;

export type IconKey = keyof typeof ICONS;

export function Icon({ name, size = 20, color }: { name: IconKey; size?: number; color?: string }) {
  const theme = useTheme();
  return <Ionicons name={ICONS[name] ?? 'ellipse'} size={size} color={color ?? theme.colors.text} />;
}
