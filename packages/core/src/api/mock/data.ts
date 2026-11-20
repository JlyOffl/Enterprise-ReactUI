import { permissionsForRoles, type Role } from '../../auth/permissions';
import type { AuthUser } from '../../auth/authSlice';
import type { DirectoryUser, Order, OrderLine, OrderStatus, Product } from '../../features/models';

/** Deterministic PRNG so mock data is stable between reloads. */
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);
const pick = <T,>(list: readonly T[]): T => list[Math.floor(rand() * list.length)]!;
const int = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();
const alnum = (len: number) =>
  Array.from({ length: len }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz0123456789'[int(0, 57)]).join('');

const FIRST = ['Ava', 'Liam', 'Noah', 'Emma', 'Olivia', 'Mateo', 'Priya', 'Arjun', 'Chen', 'Sofia', 'Lucas', 'Amara', 'Kenji', 'Zara', 'Diego', 'Fatima', 'Elena', 'Omar', 'Hana', 'Ravi'];
const LAST = ['Johnson', 'Garcia', 'Patel', 'Nguyen', 'Smith', 'Kim', 'Martinez', 'Brown', 'Rossi', 'Kumar', 'Lee', 'Okafor', 'Silva', 'Müller', 'Tanaka', 'Haddad'];
const DEPARTMENTS = ['Engineering', 'Operations', 'Finance', 'Sales', 'Support', 'Compliance', 'Clinical'];
const TITLES = ['Analyst', 'Engineer', 'Manager', 'Specialist', 'Coordinator', 'Director', 'Associate'];
const LOCATIONS = ['Atlanta, GA', 'Austin, TX', 'Chennai, IN', 'London, UK', 'Toronto, CA', 'Madrid, ES', 'Paris, FR'];
const ROLES: Role[] = ['admin', 'manager', 'agent', 'agent', 'viewer', 'viewer'];
const STATUSES = ['active', 'active', 'active', 'invited', 'suspended'] as const;

export function externalIdsFor(seed: number): Record<string, string> {
  return {
    salesforce: `003${alnum(12)}`,
    sap: String(1000000000 + seed * 7919).slice(0, 10),
    workday: `WD-${String(100000 + seed * 37).slice(0, 6)}`,
    servicenow: `SYS${(0x10000000 + seed * 104729).toString(16).slice(0, 8)}`,
  };
}

export const users: DirectoryUser[] = Array.from({ length: 64 }, (_, i) => {
  const first = pick(FIRST);
  const last = pick(LAST);
  return {
    id: `u-${1000 + i}`,
    name: `${first} ${last}`,
    email: `${first}.${last}${i}@contoso.com`.toLowerCase().replace('ü', 'u'),
    title: `${pick(['Senior ', '', 'Lead ', 'Principal '])}${pick(TITLES)}`,
    department: pick(DEPARTMENTS),
    role: pick(ROLES),
    status: pick(STATUSES),
    location: pick(LOCATIONS),
    lastActiveAt: daysAgo(rand() * 20),
    createdAt: daysAgo(int(30, 900)),
    externalIds: externalIdsFor(i + 1),
  };
});

export const products: Product[] = [
  ['Clinical Workstation', 'Hardware', 1899],
  ['Secure Badge Reader', 'Hardware', 249],
  ['Telehealth License (1yr)', 'Software', 1200],
  ['Compliance Audit Pack', 'Services', 3500],
  ['Analytics Add-on', 'Software', 640],
  ['Onsite Training Day', 'Services', 1800],
  ['Rugged Tablet', 'Hardware', 899],
  ['Priority Support (1yr)', 'Services', 2400],
  ['Data Retention Vault', 'Software', 980],
  ['Barcode Scanner', 'Hardware', 179],
].map(([name, category, price], i) => ({
  id: `p-${i + 1}`,
  sku: `SKU-${(1000 + i * 17).toString()}`,
  name: name as string,
  category: category as string,
  price: price as number,
  stock: int(0, 400),
}));

const ORDER_STATUSES: OrderStatus[] = ['pending', 'approved', 'shipped', 'delivered', 'cancelled', 'pending', 'approved'];
const CUSTOMERS = ['Northwind Health', 'Contoso Clinics', 'Fabrikam Energy', 'Tailspin Mortgage', 'Adventure Works', 'Wide World Importers', 'Litware Labs'];

export const TAX_RATE = 0.07;

export function priceOrder(lines: OrderLine[], discountPct = 0) {
  const subtotal = round2(lines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0));
  const discount = round2(subtotal * (discountPct / 100));
  const tax = round2((subtotal - discount) * TAX_RATE);
  return { subtotal, discount, tax, total: round2(subtotal - discount + tax) };
}

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}

export const orders: Order[] = Array.from({ length: 36 }, (_, i) => {
  const lines: OrderLine[] = Array.from({ length: int(1, 4) }, () => {
    const p = pick(products);
    return { productId: p.id, productName: p.name, quantity: int(1, 12), unitPrice: p.price };
  });
  const pricing = priceOrder(lines, pick([0, 0, 5, 10]));
  return {
    id: `o-${5000 + i}`,
    number: `SO-${String(24000 + i)}`,
    customer: pick(CUSTOMERS),
    status: pick(ORDER_STATUSES),
    priority: pick(['low', 'normal', 'normal', 'high'] as const),
    lines,
    ...pricing,
    currency: 'USD',
    createdAt: daysAgo(int(0, 60)),
    requestedDate: daysAgo(-int(3, 30)),
  };
});

/** Demo login accounts. */
export const DEMO_ACCOUNTS: Array<{ email: string; password: string; role: Role; name: string; title: string }> = [
  { email: 'admin@contoso.com', password: 'Admin@123', role: 'admin', name: 'Alex Morgan', title: 'Platform Administrator' },
  { email: 'manager@contoso.com', password: 'Manager@123', role: 'manager', name: 'Maya Chen', title: 'Delivery Manager' },
  { email: 'agent@contoso.com', password: 'Agent@123', role: 'agent', name: 'Diego Martinez', title: 'Support Agent' },
  { email: 'viewer@contoso.com', password: 'Viewer@123', role: 'viewer', name: 'Hana Tanaka', title: 'Auditor' },
];

export function toAuthUser(account: (typeof DEMO_ACCOUNTS)[number], index: number): AuthUser {
  return {
    id: `acct-${index + 1}`,
    name: account.name,
    email: account.email,
    title: account.title,
    department: 'Digital Platforms',
    roles: [account.role],
    permissions: permissionsForRoles([account.role]),
    externalIds: externalIdsFor(900 + index),
  };
}

export const featureFlagsRemote: Record<string, boolean> = {
  'module.orders': true,
  'module.externalSystems': true,
  'dashboard.v2Widgets': true,
  'forms.dynamicForms': true,
  'ui.modelessWindows': true,
  'orders.bulkActions': false,
  'experimental.aiAssist': false,
};
