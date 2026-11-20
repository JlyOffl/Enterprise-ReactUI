import { useCallback, useMemo } from 'react';
import { baseApi } from '../../api/baseApi';
import { defineModule } from '../../composable/FeatureModule';
import { useDataTable, type ColumnDef } from '../../headless/useDataTable';
import { usePermission } from '../../auth/hooks';
import { useToast } from '../../notifications/hooks';
import { useLocale } from '../../i18n/hooks';
import { getErrorMessage } from '../../utils/errors';
import type { DirectoryUser, PagedResult, UserStatus } from '../models';

export const usersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUsers: build.query<PagedResult<DirectoryUser>, void>({
      query: () => '/users',
      providesTags: (result) => [
        { type: 'User' as const, id: 'LIST' },
        ...(result?.items.map((u) => ({ type: 'User' as const, id: u.id })) ?? []),
      ],
    }),
    getUser: build.query<DirectoryUser, string>({
      query: (id) => `/users/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'User', id }],
    }),
    updateUser: build.mutation<DirectoryUser, { id: string; changes: Partial<DirectoryUser> }>({
      query: ({ id, changes }) => ({ url: `/users/${id}`, method: 'PATCH', body: changes }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'User', id }, { type: 'Dashboard' }],
    }),
  }),
});

export const usersModule = defineModule({
  id: 'users',
  navItems: [
    { id: 'users', path: '/users', labelKey: 'nav.users', icon: 'users', section: 'main', order: 30, primary: true, permission: 'users:read' },
  ],
});

export const USER_STATUS_TONE: Record<UserStatus, 'success' | 'warning' | 'danger'> = {
  active: 'success',
  invited: 'warning',
  suspended: 'danger',
};

export const userColumns: ColumnDef<DirectoryUser>[] = [
  { id: 'name', header: 'users.name', accessor: (u) => u.name, sortable: true },
  { id: 'department', header: 'users.department', accessor: (u) => u.department, sortable: true },
  { id: 'role', header: 'users.role', accessor: (u) => u.role, sortable: true },
  { id: 'status', header: 'users.status', accessor: (u) => u.status, sortable: true },
  { id: 'location', header: 'users.location', accessor: (u) => u.location, sortable: true },
  { id: 'lastActiveAt', header: 'users.lastActive', accessor: (u) => u.lastActiveAt, sortable: true, searchable: false },
  { id: 'email', header: 'users.email', accessor: (u) => u.email, searchable: true },
];

/** Users directory view-model shared by the web data grid and the mobile list. */
export function useUsersDirectory({ pageSize = 10 }: { pageSize?: number } = {}) {
  const query = usersApi.useGetUsersQuery();
  const [updateUser, updateState] = usersApi.useUpdateUserMutation();
  const canWrite = usePermission('users:write');
  const toast = useToast();
  const { format, t } = useLocale();
  const data = useMemo(() => query.data?.items ?? [], [query.data]);

  const table = useDataTable({
    data,
    columns: userColumns,
    getRowId: (u) => u.id,
    pageSize,
    initialSort: { columnId: 'name', direction: 'asc' },
  });

  const filterOptions = useMemo(
    () => ({
      department: [...new Set(data.map((u) => u.department))].sort(),
      role: [...new Set(data.map((u) => u.role))].sort(),
      status: ['active', 'invited', 'suspended'] as UserStatus[],
    }),
    [data],
  );

  const setStatus = useCallback(
    async (user: DirectoryUser, status: UserStatus) => {
      try {
        await updateUser({ id: user.id, changes: { status } }).unwrap();
        toast.success(t('users.updated', { name: user.name }));
      } catch (e) {
        toast.error('errors.generic', getErrorMessage(e));
      }
    },
    [updateUser, toast, t],
  );

  const suspendSelected = useCallback(async () => {
    await Promise.all(table.selectedRows.map((u) => updateUser({ id: u.id, changes: { status: 'suspended' } })));
    toast.success(t('users.updated', { name: t('common.selected', { count: table.selectedCount }) }));
    table.clearSelection();
  }, [table, updateUser, toast, t]);

  const counts = useMemo(
    () => ({
      total: data.length,
      active: data.filter((u) => u.status === 'active').length,
      invited: data.filter((u) => u.status === 'invited').length,
      suspended: data.filter((u) => u.status === 'suspended').length,
    }),
    [data],
  );

  return {
    query,
    isLoading: query.isLoading,
    isUpdating: updateState.isLoading,
    table,
    filterOptions,
    counts,
    canWrite,
    setStatus,
    suspendSelected,
    formatLastActive: (u: DirectoryUser) => format.relative(u.lastActiveAt),
  };
}
