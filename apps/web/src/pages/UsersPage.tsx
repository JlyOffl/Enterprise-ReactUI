import { useTranslation } from 'react-i18next';
import { USER_STATUS_TONE, useModal, useUsersDirectory, type DirectoryUser } from '@erui/core';
import { Avatar, Badge, Button, DataTable, DropdownMenu, IconButton, Select, StatCard, TextField } from '../components/ui';
import { PageHeader } from '../layout/PageHeader';

export default function UsersPage() {
  const { t } = useTranslation();
  const d = useUsersDirectory();
  const modal = useModal();
  const { table } = d;
  const openDetails = (user: DirectoryUser) => modal.drawer('users.details', { user }, { title: user.name, size: 'md' });

  return (
    <div className="stack gap-lg">
      <PageHeader title={t('users.title')} subtitle={t('users.subtitle')} actions={d.canWrite && <Button leftIcon="plus">{t('users.invite')}</Button>} />

      <div className="grid grid--4">
        <StatCard label={t('common.all')} value={d.counts.total} icon="users" />
        <StatCard label={t('users.statusActive')} value={d.counts.active} icon="success" />
        <StatCard label={t('users.statusInvited')} value={d.counts.invited} icon="send" />
        <StatCard label={t('users.statusSuspended')} value={d.counts.suspended} icon="shield" />
      </div>

      <DataTable
        table={table}
        loading={d.isLoading}
        selectable={d.canWrite}
        onRowClick={openDetails}
        visibleColumns={['name', 'department', 'role', 'status', 'location', 'lastActiveAt']}
        toolbar={
          <>
            <TextField
              className="grow"
              leftIcon="search"
              placeholder={t('users.searchPlaceholder')}
              value={table.search}
              onChange={(e) => table.setSearch(e.target.value)}
            />
            <Select
              placeholder={t('users.department')}
              value={table.filters.department ?? 'all'}
              onChange={(v) => table.setFilter('department', v)}
              options={[{ value: 'all', label: `${t('users.department')}: ${t('common.all')}` }, ...d.filterOptions.department.map((v) => ({ value: v, label: v }))]}
            />
            <Select
              value={table.filters.status ?? 'all'}
              onChange={(v) => table.setFilter('status', v)}
              options={[{ value: 'all', label: `${t('users.status')}: ${t('common.all')}` }, ...d.filterOptions.status.map((v) => ({ value: v, label: v }))]}
            />
            <Button variant="ghost" leftIcon="x" onClick={table.clearFilters}>
              {t('common.clear')}
            </Button>
            {table.selectedCount > 0 && (
              <Button variant="danger" leftIcon="shield" loading={d.isUpdating} onClick={d.suspendSelected}>
                {t('users.bulkSuspend')} ({table.selectedCount})
              </Button>
            )}
          </>
        }
        renderCell={(u, col) => {
          switch (col) {
            case 'name':
              return (
                <div className="row gap-sm">
                  <Avatar name={u.name} size={32} />
                  <div className="stack">
                    <strong>{u.name}</strong>
                    <span className="text-muted text-sm">{u.email}</span>
                  </div>
                </div>
              );
            case 'role':
              return <Badge tone={u.role === 'admin' ? 'primary' : u.role === 'manager' ? 'info' : 'neutral'}>{u.role}</Badge>;
            case 'status':
              return (
                <Badge tone={USER_STATUS_TONE[u.status]} dot>
                  {t(`users.status${u.status[0]!.toUpperCase()}${u.status.slice(1)}`)}
                </Badge>
              );
            case 'lastActiveAt':
              return <span className="text-muted">{d.formatLastActive(u)}</span>;
            default:
              return String(table.columns.find((c) => c.id === col)?.accessor(u) ?? '');
          }
        }}
        rowActions={(u) => (
          <DropdownMenu
            trigger={({ toggle }) => <IconButton icon="more" label={t('common.actions')} size="sm" onClick={toggle} />}
            items={[
              { id: 'view', label: t('common.details'), icon: 'eye', onSelect: () => openDetails(u) },
              ...(d.canWrite
                ? [
                    u.status === 'suspended'
                      ? { id: 'activate', label: t('users.activate'), icon: 'success' as const, onSelect: () => d.setStatus(u, 'active') }
                      : { id: 'suspend', label: t('users.suspend'), icon: 'shield' as const, danger: true, onSelect: () => d.setStatus(u, 'suspended') },
                  ]
                : []),
            ]}
          />
        )}
      />
    </div>
  );
}
