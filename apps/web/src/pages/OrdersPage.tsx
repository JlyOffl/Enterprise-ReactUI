import { useTranslation } from 'react-i18next';
import { ORDER_STATUS_TONE, useModal, useOrdersList, type Order } from '@erui/core';
import { Badge, Button, DataTable, DropdownMenu, IconButton, Tabs, TextField, type MenuItemDef } from '../components/ui';
import { PageHeader } from '../layout/PageHeader';

export default function OrdersPage() {
  const { t } = useTranslation();
  const o = useOrdersList();
  const modal = useModal();

  const actionsFor = (order: Order): MenuItemDef[] => {
    const items: MenuItemDef[] = [];
    if (o.canApprove && order.status === 'pending') items.push({ id: 'approve', label: t('orders.approve'), icon: 'check', onSelect: () => o.approve(order) });
    if (o.canWrite && order.status === 'approved') items.push({ id: 'ship', label: 'Ship', icon: 'send', onSelect: () => o.ship(order) });
    if (o.canWrite && ['pending', 'approved'].includes(order.status))
      items.push({
        id: 'cancel',
        label: t('orders.cancelOrder'),
        icon: 'x',
        danger: true,
        onSelect: async () => {
          if (await modal.confirm({ title: `${t('orders.cancelOrder')} ${order.number}?`, message: 'modals.confirmMessage', tone: 'danger' })) o.cancel(order);
        },
      });
    return items.length ? items : [{ id: 'none', label: '—', disabled: true }];
  };

  return (
    <div className="stack gap-lg">
      <PageHeader
        title={t('orders.title')}
        subtitle={t('orders.subtitle')}
        actions={
          o.canWrite && (
            <Button leftIcon="plus" onClick={() => modal.drawer('orders.create', {}, { title: 'orders.newOrder', size: 'lg' })}>
              {t('orders.newOrder')}
            </Button>
          )
        }
      />
      <Tabs
        value={o.status}
        onChange={(s) => o.setStatus(s as typeof o.status)}
        items={o.statuses.map((s) => ({ id: s, label: t(`orders.statuses.${s}`), badge: o.counts[s] ?? 0 }))}
      />
      <DataTable
        table={o.table}
        loading={o.query.isLoading}
        selectable={o.bulkEnabled}
        toolbar={
          <>
            <TextField className="grow" leftIcon="search" placeholder={t('common.search')} value={o.table.search} onChange={(e) => o.table.setSearch(e.target.value)} />
            {o.bulkEnabled && o.table.selectedCount > 0 && (
              <Button leftIcon="check" onClick={o.approveSelected}>
                {t('orders.bulkApprove')} ({o.table.selectedCount})
              </Button>
            )}
          </>
        }
        renderCell={(order, col) => {
          switch (col) {
            case 'number':
              return <code>{order.number}</code>;
            case 'status':
              return (
                <Badge tone={ORDER_STATUS_TONE[order.status]} dot>
                  {t(`orders.statuses.${order.status}`)}
                </Badge>
              );
            case 'priority':
              return <Badge tone={order.priority === 'high' ? 'danger' : order.priority === 'low' ? 'neutral' : 'info'} variant="outline">{t(`orders.priorities.${order.priority}`)}</Badge>;
            case 'total':
              return <strong>{o.formatTotal(order)}</strong>;
            case 'createdAt':
              return <span className="text-muted">{o.formatDate(order.createdAt)}</span>;
            default:
              return order.customer;
          }
        }}
        rowActions={(order) => (
          <DropdownMenu trigger={({ toggle }) => <IconButton icon="more" label={t('common.actions')} size="sm" onClick={toggle} />} items={actionsFor(order)} />
        )}
      />
    </div>
  );
}
