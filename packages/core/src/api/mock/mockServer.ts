import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { sleep } from '../../utils/id';
import type { Order, OrderLine, OrderStatus } from '../../features/models';
import {
  DEMO_ACCOUNTS,
  featureFlagsRemote,
  orders,
  priceOrder,
  products,
  toAuthUser,
  users,
} from './data';

export interface MockRequest {
  url: string;
  method: string;
  body?: unknown;
  params?: Record<string, unknown>;
  headers: Record<string, string>;
}

export type MockResponse = { data: unknown; meta?: { status: number } } | { error: FetchBaseQueryError };

/** Runtime knobs so the Observability page can simulate latency, failures and outages. */
export const mockControl = {
  minLatencyMs: 150,
  maxLatencyMs: 550,
  /** 0..1 probability that any non-auth call fails with 503. */
  failureRate: 0,
  healthMode: 'normal' as 'normal' | 'degraded' | 'down',
};

const ok = (data: unknown, status = 200): MockResponse => ({ data, meta: { status } });
const fail = (status: number, message: string, extra?: Record<string, unknown>): MockResponse => ({
  error: { status, data: { message, ...extra } },
});

const b64url = (obj: unknown) => btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

function issueToken(email: string, roles: string[], ttlMs: number) {
  const iat = Math.floor(Date.now() / 1000);
  const exp = Math.floor((Date.now() + ttlMs) / 1000);
  return { token: `${b64url({ alg: 'none', typ: 'JWT' })}.${b64url({ sub: email, email, roles, iat, exp })}.mock`, exp };
}

function userFromAuthHeader(headers: Record<string, string>) {
  const auth = headers.authorization ?? headers.Authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    const claims = JSON.parse(atob(auth.slice(7).split('.')[1]!.replace(/-/g, '+').replace(/_/g, '/'))) as {
      email: string;
      exp: number;
    };
    if (claims.exp * 1000 < Date.now()) return null;
    const index = DEMO_ACCOUNTS.findIndex((a) => a.email === claims.email);
    return index >= 0 ? toAuthUser(DEMO_ACCOUNTS[index]!, index) : null;
  } catch {
    return null;
  }
}

function parseUrl(raw: string, params?: Record<string, unknown>) {
  const [path = '', query = ''] = raw.split('?');
  const search: Record<string, string> = {};
  query
    .split('&')
    .filter(Boolean)
    .forEach((pair) => {
      const [k, v = ''] = pair.split('=');
      search[decodeURIComponent(k!)] = decodeURIComponent(v);
    });
  Object.entries(params ?? {}).forEach(([k, v]) => v !== undefined && (search[k] = String(v)));
  return { path: path.replace(/\/+$/, '') || '/', search };
}

let orderSeq = 25000;

/**
 * In-process mock backend. Lets the whole app (auth, CRUD, health, flags) run with zero
 * infrastructure. Switch `useMockApi` off in config to hit a real API with the same contracts.
 */
export async function handleMockRequest(req: MockRequest): Promise<MockResponse> {
  const { path, search } = parseUrl(req.url, req.params);
  const method = req.method.toUpperCase();
  await sleep(mockControl.minLatencyMs + Math.random() * (mockControl.maxLatencyMs - mockControl.minLatencyMs));

  // Public endpoints ---------------------------------------------------------------------
  if (path === '/auth/login' && method === 'POST') {
    const { email, password } = (req.body ?? {}) as { email?: string; password?: string };
    const index = DEMO_ACCOUNTS.findIndex((a) => a.email === email?.toLowerCase() && a.password === password);
    if (index < 0) return fail(401, 'Invalid email or password', { code: 'auth.invalidCredentials' });
    const account = DEMO_ACCOUNTS[index]!;
    const { token, exp } = issueToken(account.email, [account.role], 60 * 60_000);
    return ok({ user: toAuthUser(account, index), token, expiresAt: exp * 1000 });
  }

  if (path === '/health') {
    const dependencies = [
      { name: 'orders-db', status: 'ok' as const, latencyMs: 12 + Math.round(Math.random() * 20) },
      { name: 'identity', status: 'ok' as const, latencyMs: 30 + Math.round(Math.random() * 40) },
      {
        name: 'search',
        status: mockControl.healthMode === 'normal' ? ('ok' as const) : ('degraded' as const),
        latencyMs: mockControl.healthMode === 'normal' ? 45 : 1800,
      },
    ];
    if (mockControl.healthMode === 'down') return fail(503, 'Service unavailable');
    return ok({ status: mockControl.healthMode === 'normal' ? 'ok' : 'degraded', version: '2026.11.1', dependencies });
  }

  if (path === '/feature-flags') return ok({ ...featureFlagsRemote });

  // Authenticated endpoints ----------------------------------------------------------------
  const currentUser = userFromAuthHeader(req.headers);
  if (!currentUser) return fail(401, 'Authentication required');

  if (mockControl.failureRate > 0 && Math.random() < mockControl.failureRate) {
    return fail(503, 'Simulated upstream failure', { code: 'mock.simulatedFailure' });
  }

  if (path === '/auth/me') return ok(currentUser);

  if (path === '/users' && method === 'GET') return ok({ items: users, total: users.length });

  const userMatch = path.match(/^\/users\/([^/]+)$/);
  if (userMatch) {
    const user = users.find((u) => u.id === userMatch[1]);
    if (!user) return fail(404, 'User not found');
    if (method === 'GET') return ok(user);
    if (method === 'PATCH') {
      Object.assign(user, req.body as object);
      return ok(user);
    }
  }

  if (path === '/external-systems/lookup') {
    const system = search.system ?? '';
    const id = search.id ?? '';
    const match = users.find((u) => u.externalIds[system]?.toLowerCase() === id.toLowerCase());
    return match ? ok(match) : fail(404, `No user with ${system} id ${id}`);
  }

  if (path === '/products') return ok(products);

  if (path === '/orders' && method === 'GET') {
    const status = search.status as OrderStatus | undefined;
    const list = status && status !== ('all' as string) ? orders.filter((o) => o.status === status) : orders;
    return ok([...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
  }

  if (path === '/orders' && method === 'POST') {
    const input = req.body as {
      customer: string;
      priority: Order['priority'];
      requestedDate: string;
      discountPct?: number;
      notes?: string;
      lines: Array<Pick<OrderLine, 'productId' | 'quantity'>>;
    };
    const lines: OrderLine[] = input.lines.map((l) => {
      const p = products.find((x) => x.id === l.productId);
      return { productId: l.productId, productName: p?.name ?? 'Unknown', quantity: l.quantity, unitPrice: p?.price ?? 0 };
    });
    const order: Order = {
      id: `o-${++orderSeq}`,
      number: `SO-${orderSeq}`,
      customer: input.customer,
      priority: input.priority,
      status: 'pending',
      lines,
      ...priceOrder(lines, input.discountPct ?? 0),
      currency: 'USD',
      createdAt: new Date().toISOString(),
      requestedDate: input.requestedDate,
      notes: input.notes,
    };
    orders.unshift(order);
    return ok(order, 201);
  }

  const statusMatch = path.match(/^\/orders\/([^/]+)\/status$/);
  if (statusMatch && method === 'PATCH') {
    const order = orders.find((o) => o.id === statusMatch[1]);
    if (!order) return fail(404, 'Order not found');
    order.status = (req.body as { status: OrderStatus }).status;
    return ok(order);
  }

  if (path === '/dashboard/stats') {
    const byStatus = orders.reduce(
      (acc, o) => ({ ...acc, [o.status]: (acc[o.status] ?? 0) + 1 }),
      {} as Record<OrderStatus, number>,
    );
    const revenue = orders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
    const months = ['Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];
    return ok({
      revenue,
      revenueChange: 0.124,
      orders: orders.length,
      ordersChange: 0.058,
      activeUsers: users.filter((u) => u.status === 'active').length,
      usersChange: -0.021,
      conversionRate: 0.318,
      conversionChange: 0.034,
      revenueSeries: months.map((label, i) => ({ label, value: Math.round(revenue / 8 + i * 4200 + Math.sin(i) * 6000) })),
      ordersByStatus: Object.assign({ draft: 0, pending: 0, approved: 0, shipped: 0, delivered: 0, cancelled: 0 }, byStatus),
      recentActivity: orders.slice(0, 6).map((o, i) => ({
        id: `act-${i}`,
        actor: users[i]!.name,
        action: i % 2 ? 'approved' : 'created',
        target: o.number,
        at: o.createdAt,
      })),
    });
  }

  if (path.startsWith('/forms/') && method === 'POST') {
    return ok({ id: `sub-${Date.now()}`, receivedAt: new Date().toISOString(), payload: req.body }, 201);
  }

  if (path === '/logs' && method === 'POST') return ok({ accepted: true }, 202);

  return fail(404, `No mock route for ${method} ${path}`);
}
