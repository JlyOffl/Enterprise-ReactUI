import type { Role } from '../auth/permissions';

export type UserStatus = 'active' | 'invited' | 'suspended';

export interface DirectoryUser {
  id: string;
  name: string;
  email: string;
  title: string;
  department: string;
  role: Role;
  status: UserStatus;
  location: string;
  lastActiveAt: string;
  createdAt: string;
  externalIds: Record<string, string>;
}

export type OrderStatus = 'draft' | 'pending' | 'approved' | 'shipped' | 'delivered' | 'cancelled';
export type OrderPriority = 'low' | 'normal' | 'high';

export interface OrderLine {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  number: string;
  customer: string;
  status: OrderStatus;
  priority: OrderPriority;
  lines: OrderLine[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  currency: string;
  createdAt: string;
  requestedDate: string;
  notes?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

export interface SeriesPoint {
  label: string;
  value: number;
}

export interface ActivityItem {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
}

export interface DashboardStats {
  revenue: number;
  revenueChange: number;
  orders: number;
  ordersChange: number;
  activeUsers: number;
  usersChange: number;
  conversionRate: number;
  conversionChange: number;
  revenueSeries: SeriesPoint[];
  ordersByStatus: Record<OrderStatus, number>;
  recentActivity: ActivityItem[];
}

export interface PagedResult<T> {
  items: T[];
  total: number;
}

export interface HealthResponse {
  status: 'ok' | 'degraded' | 'down';
  version: string;
  dependencies: Array<{ name: string; status: 'ok' | 'degraded' | 'down'; latencyMs: number }>;
}
