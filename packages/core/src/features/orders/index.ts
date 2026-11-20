import { useCallback, useMemo, useState } from 'react';
import { useFieldArray } from 'react-hook-form';
import { baseApi } from '../../api/baseApi';
import { defineModule } from '../../composable/FeatureModule';
import { TYPES } from '../../di/tokens';
import { useService } from '../../di/DIProvider';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { useDataTable, type ColumnDef } from '../../headless/useDataTable';
import { usePermission } from '../../auth/hooks';
import { useFeatureFlag } from '../../featureFlags/hooks';
import { FLAGS } from '../../featureFlags/definitions';
import { useToast } from '../../notifications/hooks';
import { useLocale } from '../../i18n/hooks';
import { useAnalytics } from '../../instrumentation/hooks';
import { useZodForm } from '../../validation/useZodForm';
import { orderSchema, type OrderFormValues } from '../../validation/schemas';
import { getErrorMessage } from '../../utils/errors';
import { toIsoDate } from '../../utils/format';
import type { Order, OrderStatus, Product } from '../models';
import { OrderPricingService } from './OrderPricingService';
import { draftCleared, draftSaved, selectDraftSavedAt, selectOrderDraft } from './orderDraftSlice';

export { OrderPricingService } from './OrderPricingService';
export * from './orderDraftSlice';

export const ordersApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getOrders: build.query<Order[], OrderStatus | 'all'>({
      query: (status) => ({ url: '/orders', params: status === 'all' ? undefined : { status } }),
      providesTags: (result) => [
        { type: 'Order' as const, id: 'LIST' },
        ...(result?.map((o) => ({ type: 'Order' as const, id: o.id })) ?? []),
      ],
    }),
    getProducts: build.query<Product[], void>({
      query: () => '/products',
      providesTags: ['Product'],
    }),
    createOrder: build.mutation<
      Order,
      Omit<OrderFormValues, 'lines'> & { lines: Array<{ productId: string; quantity: number }> }
    >({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      invalidatesTags: [{ type: 'Order', id: 'LIST' }, 'Dashboard'],
    }),
    updateOrderStatus: build.mutation<Order, { id: string; status: OrderStatus }>({
      query: ({ id, status }) => ({ url: `/orders/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Order', id }, { type: 'Order', id: 'LIST' }, 'Dashboard'],
    }),
  }),
});

export const ordersModule = defineModule({
  id: 'orders',
  featureFlag: FLAGS.ordersModule,
  navItems: [
    { id: 'orders', path: '/orders', labelKey: 'nav.orders', icon: 'cart', section: 'main', order: 40, primary: true, permission: 'orders:read' },
  ],
  register(container) {
    if (!container.isBound(TYPES.OrderPricingService)) {
      container.bind(TYPES.OrderPricingService).toConstantValue(new OrderPricingService());
    }
  },
});

export const ORDER_STATUSES: Array<OrderStatus | 'all'> = ['all', 'pending', 'approved', 'shipped', 'delivered', 'cancelled'];

export const orderColumns: ColumnDef<Order>[] = [
  { id: 'number', header: 'orders.number', accessor: (o) => o.number, sortable: true },
  { id: 'customer', header: 'orders.customer', accessor: (o) => o.customer, sortable: true },
  { id: 'status', header: 'orders.status', accessor: (o) => o.status, sortable: true },
  { id: 'priority', header: 'orders.priority', accessor: (o) => o.priority, sortable: true },
  { id: 'total', header: 'orders.total', accessor: (o) => o.total, sortable: true, align: 'right', searchable: false },
  { id: 'createdAt', header: 'orders.created', accessor: (o) => o.createdAt, sortable: true, searchable: false },
];

/** Orders list view-model: status filter tabs, grid, status transitions, bulk actions. */
export function useOrdersList() {
  const [status, setStatus] = useState<OrderStatus | 'all'>('all');
  const query = ordersApi.useGetOrdersQuery(status);
  const allOrders = ordersApi.useGetOrdersQuery('all');
  const [updateStatus] = ordersApi.useUpdateOrderStatusMutation();
  const canApprove = usePermission('orders:approve');
  const canWrite = usePermission('orders:write');
  const bulkEnabled = useFeatureFlag(FLAGS.ordersBulkActions);
  const toast = useToast();
  const { format } = useLocale();
  const data = useMemo(() => query.data ?? [], [query.data]);

  const table = useDataTable({
    data,
    columns: orderColumns,
    getRowId: (o) => o.id,
    pageSize: 8,
    initialSort: { columnId: 'createdAt', direction: 'desc' },
  });

  const counts = useMemo(() => {
    const list = allOrders.data ?? [];
    return Object.fromEntries(
      ORDER_STATUSES.map((s) => [s, s === 'all' ? list.length : list.filter((o) => o.status === s).length]),
    ) as Record<OrderStatus | 'all', number>;
  }, [allOrders.data]);

  const transition = useCallback(
    async (order: Order, next: OrderStatus) => {
      try {
        await updateStatus({ id: order.id, status: next }).unwrap();
        toast.success(`${order.number} → ${next}`);
      } catch (e) {
        toast.error('errors.generic', getErrorMessage(e));
      }
    },
    [updateStatus, toast],
  );

  const approveSelected = useCallback(async () => {
    const pending = table.selectedRows.filter((o) => o.status === 'pending');
    await Promise.all(pending.map((o) => updateStatus({ id: o.id, status: 'approved' })));
    toast.success(`${pending.length} approved`);
    table.clearSelection();
  }, [table, updateStatus, toast]);

  return {
    status,
    setStatus,
    statuses: ORDER_STATUSES,
    counts,
    query,
    table,
    canApprove,
    canWrite,
    bulkEnabled: bulkEnabled && canApprove,
    approve: (o: Order) => transition(o, 'approved'),
    cancel: (o: Order) => transition(o, 'cancelled'),
    ship: (o: Order) => transition(o, 'shipped'),
    approveSelected,
    formatTotal: (o: Order) => format.currency(o.total, o.currency),
    formatDate: (iso: string) => format.date(iso),
  };
}

function defaultOrderValues(): OrderFormValues {
  return {
    customer: '',
    priority: 'normal',
    requestedDate: toIsoDate(new Date(Date.now() + 7 * 86_400_000)),
    discountPct: 0,
    notes: '',
    lines: [{ productId: '', quantity: 1 }],
  };
}

/** Order capture view-model: validation, dynamic line items, live pricing, drafts, submit. */
export function useOrderForm({ onCreated }: { onCreated?: (order: Order) => void } = {}) {
  const dispatch = useAppDispatch();
  const draft = useAppSelector(selectOrderDraft);
  const draftSavedAt = useAppSelector(selectDraftSavedAt);
  const pricing = useService<OrderPricingService>(TYPES.OrderPricingService);
  const products = ordersApi.useGetProductsQuery();
  const [createOrder, createState] = ordersApi.useCreateOrderMutation();
  const toast = useToast();
  const analytics = useAnalytics();
  const { format, t } = useLocale();

  const form = useZodForm(orderSchema, { defaultValues: draft ?? defaultOrderValues() });
  const lines = useFieldArray({ control: form.control, name: 'lines' });
  const watchedLines = form.watch('lines');
  const discountPct = form.watch('discountPct');
  const priority = form.watch('priority');

  const quote = useMemo(
    () =>
      pricing.quote(
        (watchedLines ?? []).map((l) => ({ productId: l.productId, quantity: Number(l.quantity) })),
        products.data ?? [],
        Number(discountPct) || 0,
      ),
    [pricing, watchedLines, discountPct, products.data],
  );

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      const order = await createOrder(values).unwrap();
      analytics.track('orders.created', { total: order.total, lines: order.lines.length, priority: order.priority });
      toast.success(t('orders.createdSuccess', { number: order.number }));
      dispatch(draftCleared());
      form.reset(defaultOrderValues());
      onCreated?.(order);
    } catch (e) {
      toast.error('errors.generic', getErrorMessage(e));
    }
  });

  return {
    form,
    lines,
    products: products.data ?? [],
    productOptions: (products.data ?? []).map((p) => ({
      value: p.id,
      label: p.name,
      description: `${p.sku} · ${format.currency(p.price)} · ${p.stock} in stock`,
    })),
    quote,
    formatted: {
      subtotal: format.currency(quote.subtotal),
      discount: format.currency(quote.discount),
      tax: format.currency(quote.tax),
      total: format.currency(quote.total),
      line: (n: number) => format.currency(n),
    },
    requiresApproval: pricing.requiresApproval(quote.total, priority),
    addLine: () => lines.append({ productId: '', quantity: 1 }),
    removeLine: (index: number) => lines.fields.length > 1 && lines.remove(index),
    saveDraft: () => {
      dispatch(draftSaved(form.getValues()));
      toast.info('orders.draftSaved');
    },
    hasDraft: !!draft,
    draftSavedAt,
    discardDraft: () => {
      dispatch(draftCleared());
      form.reset(defaultOrderValues());
    },
    onSubmit,
    isSubmitting: createState.isLoading,
  };
}
