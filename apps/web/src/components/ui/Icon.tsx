import {
  Activity, AppWindow, ArrowDown, ArrowUp, ArrowUpDown, Bell, Calendar, Check, ChevronDown, ChevronLeft,
  ChevronRight, ChevronUp, Circle, CircleAlert, CircleCheck, Clock, Copy, Download, Ellipsis, ExternalLink,
  Eye, EyeOff, File, FileText, Filter, Flag, Folder, Globe, GripHorizontal, Home, Info, LayoutGrid, Layers,
  Link2, LogOut, Maximize2, Menu, Minimize2, Minus, Monitor, Moon, PanelLeft, Pencil, Plus, RefreshCw, Save,
  Search, Send, Settings, Shield, ShoppingCart, Star, Sun, Trash2, TrendingDown, TrendingUp, TriangleAlert,
  Upload, User, Users, X, Zap, type LucideIcon,
} from 'lucide-react';
import type { IconName } from '@erui/core';

const ICONS = {
  // shared navigation icon names (core IconName)
  home: Home,
  grid: LayoutGrid,
  form: FileText,
  layers: Layers,
  users: Users,
  cart: ShoppingCart,
  window: AppWindow,
  flag: Flag,
  activity: Activity,
  link: Link2,
  settings: Settings,
  logout: LogOut,
  menu: Menu,
  more: Ellipsis,
  // web extras
  check: Check,
  x: X,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  search: Search,
  plus: Plus,
  minus: Minus,
  trash: Trash2,
  edit: Pencil,
  upload: Upload,
  download: Download,
  file: File,
  folder: Folder,
  star: Star,
  calendar: Calendar,
  bell: Bell,
  info: Info,
  warning: TriangleAlert,
  error: CircleAlert,
  success: CircleCheck,
  sun: Sun,
  moon: Moon,
  monitor: Monitor,
  globe: Globe,
  eye: Eye,
  eyeOff: EyeOff,
  copy: Copy,
  external: ExternalLink,
  refresh: RefreshCw,
  filter: Filter,
  sort: ArrowUpDown,
  sortAsc: ArrowUp,
  sortDesc: ArrowDown,
  user: User,
  dot: Circle,
  minimize: Minimize2,
  maximize: Maximize2,
  grip: GripHorizontal,
  save: Save,
  send: Send,
  zap: Zap,
  shield: Shield,
  clock: Clock,
  trendUp: TrendingUp,
  trendDown: TrendingDown,
  panel: PanelLeft,
} satisfies Record<IconName | string, LucideIcon>;

export type IconKey = keyof typeof ICONS;

export interface IconProps {
  name: IconKey;
  size?: number;
  className?: string;
  strokeWidth?: number;
  'aria-label'?: string;
}

export function Icon({ name, size = 18, className, strokeWidth = 2, ...rest }: IconProps) {
  const Cmp = ICONS[name] ?? Circle;
  return (
    <Cmp
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden={rest['aria-label'] ? undefined : true}
      aria-label={rest['aria-label']}
    />
  );
}
