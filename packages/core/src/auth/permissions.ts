export type Role = 'admin' | 'manager' | 'agent' | 'viewer';

export type Permission =
  | 'dashboard:read'
  | 'users:read'
  | 'users:write'
  | 'orders:read'
  | 'orders:write'
  | 'orders:approve'
  | 'flags:manage'
  | 'observability:read'
  | 'integrations:read'
  | 'settings:write';

export const ALL_PERMISSIONS: Permission[] = [
  'dashboard:read',
  'users:read',
  'users:write',
  'orders:read',
  'orders:write',
  'orders:approve',
  'flags:manage',
  'observability:read',
  'integrations:read',
  'settings:write',
];

/** Role based access control matrix (authorization). */
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ALL_PERMISSIONS,
  manager: [
    'dashboard:read',
    'users:read',
    'orders:read',
    'orders:write',
    'orders:approve',
    'observability:read',
    'integrations:read',
    'settings:write',
  ],
  agent: ['dashboard:read', 'users:read', 'orders:read', 'orders:write', 'settings:write'],
  viewer: ['dashboard:read', 'orders:read'],
};

export function permissionsForRoles(roles: Role[]): Permission[] {
  return [...new Set(roles.flatMap((r) => ROLE_PERMISSIONS[r] ?? []))];
}

export type PermissionMode = 'all' | 'any';

export function hasPermission(
  granted: readonly Permission[],
  required: Permission | readonly Permission[] | undefined,
  mode: PermissionMode = 'all',
): boolean {
  if (!required) return true;
  const list = Array.isArray(required) ? required : [required as Permission];
  if (!list.length) return true;
  return mode === 'all' ? list.every((p) => granted.includes(p)) : list.some((p) => granted.includes(p));
}
