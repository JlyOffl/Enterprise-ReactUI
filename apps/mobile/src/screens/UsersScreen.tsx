import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { USER_STATUS_TONE, useModal, useUsersDirectory, type DirectoryUser } from '@erui/core';
import { ActionMenu, Avatar, Badge, Button, DataList, IconButton, Select, StatCard, Text } from '../components/ui';
import { Screen } from '../components/Screen';

export default function UsersScreen() {
  const { t } = useTranslation();
  const d = useUsersDirectory({ pageSize: 8 });
  const modal = useModal();
  const { table } = d;
  const openDetails = (u: DirectoryUser) => modal.drawer('users.details', { user: u }, { title: u.name });

  return (
    <Screen title={t('users.title')} subtitle={t('users.subtitle')} onRefresh={d.query.refetch} refreshing={d.query.isFetching && !d.isLoading}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}><StatCard label={t('users.statusActive')} value={d.counts.active} icon="success" /></View>
        <View style={{ flex: 1 }}><StatCard label={t('users.statusSuspended')} value={d.counts.suspended} icon="shield" /></View>
      </View>
      <Select
        value={table.filters.department ?? 'all'}
        onChange={(v) => table.setFilter('department', v)}
        options={[{ value: 'all', label: `${t('users.department')}: ${t('common.all')}` }, ...d.filterOptions.department.map((v) => ({ value: v, label: v }))]}
      />
      <DataList
        table={table}
        loading={d.isLoading}
        selectable={d.canWrite}
        onItemPress={openDetails}
        searchPlaceholder={t('users.searchPlaceholder')}
        sortableColumns={['name', 'department', 'status', 'lastActiveAt']}
        headerRight={table.selectedCount > 0 && <Button size="sm" variant="danger" onPress={d.suspendSelected}>{t('users.bulkSuspend')}</Button>}
        renderItem={(u) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar name={u.name} size={40} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text weight="600" numberOfLines={1}>{u.name}</Text>
              <Text variant="caption" tone="muted" numberOfLines={1}>{u.department} · {u.location}</Text>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <Badge tone={USER_STATUS_TONE[u.status]} dot>{u.status}</Badge>
                <Badge tone={u.role === 'admin' ? 'primary' : 'neutral'}>{u.role}</Badge>
              </View>
            </View>
            {d.canWrite && (
              <ActionMenu
                title={u.name}
                trigger={(open) => <IconButton icon="more" label={t('common.actions')} onPress={open} />}
                items={[
                  { id: 'view', label: t('common.details'), icon: 'eye', onSelect: () => openDetails(u) },
                  u.status === 'suspended'
                    ? { id: 'activate', label: t('users.activate'), icon: 'success', onSelect: () => d.setStatus(u, 'active') }
                    : { id: 'suspend', label: t('users.suspend'), icon: 'shield', danger: true, onSelect: () => d.setStatus(u, 'suspended') },
                ]}
              />
            )}
          </View>
        )}
      />
    </Screen>
  );
}
