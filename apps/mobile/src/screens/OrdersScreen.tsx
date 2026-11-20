import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ORDER_STATUS_TONE, useModal, useOrdersList, type Order } from '@erui/core';
import { ActionMenu, Badge, Button, DataList, IconButton, Tabs, Text, type MenuItemDef } from '../components/ui';
import { Screen } from '../components/Screen';

export default function OrdersScreen() {
  const { t } = useTranslation();
  const o = useOrdersList();
  const modal = useModal();

  const actionsFor = (order: Order): MenuItemDef[] => {
    const items: MenuItemDef[] = [];
    if (o.canApprove && order.status === 'pending') items.push({ id: 'approve', label: t('orders.approve'), icon: 'check', onSelect: () => o.approve(order) });
    if (o.canWrite && order.status === 'approved') items.push({ id: 'ship', label: 'Ship', icon: 'send', onSelect: () => o.ship(order) });
    if (o.canWrite && (order.status === 'pending' || order.status === 'approved'))
      items.push({
        id: 'cancel',
        label: t('orders.cancelOrder'),
        icon: 'x',
        danger: true,
        onSelect: async () => {
          if (await modal.confirm({ title: `${t('orders.cancelOrder')} ${order.number}?`, message: 'modals.confirmMessage', tone: 'danger' })) o.cancel(order);
        },
      });
    return items;
  };

  return (
    <Screen
      title={t('orders.title')}
      subtitle={t('orders.subtitle')}
      onRefresh={o.query.refetch}
      refreshing={o.query.isFetching && !o.query.isLoading}
      actions={o.canWrite && <IconButton icon="plus" variant="primary" label={t('orders.newOrder')} onPress={() => modal.drawer('orders.create', {}, { title: 'orders.newOrder', size: 'lg' })} />}
    >
      <Tabs value={o.status} onChange={(s) => o.setStatus(s as typeof o.status)} items={o.statuses.map((s) => ({ id: s, label: t(`orders.statuses.${s}`), badge: o.counts[s] ?? 0 }))} />
      <DataList
        table={o.table}
        loading={o.query.isLoading}
        selectable={o.bulkEnabled}
        sortableColumns={['createdAt', 'total', 'customer', 'priority']}
        headerRight={o.bulkEnabled && o.table.selectedCount > 0 && <Button size="sm" onPress={o.approveSelected}>{t('orders.bulkApprove')}</Button>}
        renderItem={(order) => {
          const actions = actionsFor(order);
          return (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ flex: 1, gap: 4 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text weight="700">{order.number}</Text>
                  <Text weight="700">{o.formatTotal(order)}</Text>
                </View>
                <Text tone="muted" numberOfLines={1}>{order.customer} · {o.formatDate(order.createdAt)}</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  <Badge tone={ORDER_STATUS_TONE[order.status]} dot>{t(`orders.statuses.${order.status}`)}</Badge>
                  <Badge tone={order.priority === 'high' ? 'danger' : 'neutral'} variant="outline">{t(`orders.priorities.${order.priority}`)}</Badge>
                </View>
              </View>
              {actions.length > 0 && <ActionMenu title={order.number} trigger={(open) => <IconButton icon="more" label={t('common.actions')} onPress={open} />} items={actions} />}
            </View>
          );
        }}
      />
    </Screen>
  );
}
