import { useEffect, useMemo, useState } from 'react';
import { usePagination } from './collections';

export type SortDirection = 'asc' | 'desc';

export interface ColumnDef<T> {
  id: string;
  /** i18n key or text */
  header: string;
  accessor: (row: T) => string | number | boolean | null | undefined;
  sortable?: boolean;
  searchable?: boolean;
  align?: 'left' | 'right' | 'center';
  width?: number;
}

export interface SortState {
  columnId: string;
  direction: SortDirection;
}

/**
 * Headless data grid: global search, column filters, multi-state sorting, row selection and
 * pagination. Platform tables (HTML table on web, FlatList on mobile) only render.
 */
export function useDataTable<T>({
  data,
  columns,
  getRowId,
  pageSize: initialPageSize = 10,
  initialSort = null,
}: {
  data: T[];
  columns: ColumnDef<T>[];
  getRowId: (row: T) => string;
  pageSize?: number;
  initialSort?: SortState | null;
}) {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sort, setSort] = useState<SortState | null>(initialSort);
  const [selection, setSelection] = useState<Set<string>>(new Set());
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const searchable = columns.filter((c) => c.searchable !== false);
    return data.filter((row) => {
      const matchesSearch =
        !q || searchable.some((c) => String(c.accessor(row) ?? '').toLowerCase().includes(q));
      const matchesFilters = Object.entries(filters).every(([colId, value]) => {
        if (!value || value === 'all') return true;
        const col = columns.find((c) => c.id === colId);
        return col ? String(col.accessor(row) ?? '') === value : true;
      });
      return matchesSearch && matchesFilters;
    });
  }, [data, columns, search, filters]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const col = columns.find((c) => c.id === sort.columnId);
    if (!col) return filtered;
    const dir = sort.direction === 'asc' ? 1 : -1;
    return [...filtered].sort((a, b) => {
      const av = col.accessor(a);
      const bv = col.accessor(b);
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av).localeCompare(String(bv), undefined, { numeric: true }) * dir;
    });
  }, [filtered, sort, columns]);

  useEffect(() => setPage(1), [search, filters, pageSize]);

  const pagination = usePagination({ total: sorted.length, pageSize, page, onChange: setPage });
  const rows = useMemo(
    () => sorted.slice((pagination.page - 1) * pageSize, pagination.page * pageSize),
    [sorted, pagination.page, pageSize],
  );
  const pageIds = rows.map(getRowId);
  const allOnPageSelected = pageIds.length > 0 && pageIds.every((id) => selection.has(id));

  return {
    columns,
    rows,
    filteredRows: sorted,
    total: data.length,
    filteredTotal: sorted.length,
    search,
    setSearch,
    filters,
    setFilter: (columnId: string, value: string) => setFilters((f) => ({ ...f, [columnId]: value })),
    clearFilters: () => {
      setFilters({});
      setSearch('');
    },
    sort,
    /** none -> asc -> desc -> none */
    toggleSort: (columnId: string) =>
      setSort((s) =>
        !s || s.columnId !== columnId
          ? { columnId, direction: 'asc' }
          : s.direction === 'asc'
            ? { columnId, direction: 'desc' }
            : null,
      ),
    sortDirectionOf: (columnId: string): SortDirection | null => (sort?.columnId === columnId ? sort.direction : null),
    selection,
    selectedCount: selection.size,
    selectedRows: data.filter((r) => selection.has(getRowId(r))),
    isSelected: (id: string) => selection.has(id),
    toggleRow: (id: string) =>
      setSelection((prev) => {
        const next = new Set(prev);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        return next;
      }),
    toggleAllOnPage: () =>
      setSelection((prev) => {
        const next = new Set(prev);
        if (allOnPageSelected) pageIds.forEach((id) => next.delete(id));
        else pageIds.forEach((id) => next.add(id));
        return next;
      }),
    allOnPageSelected,
    someOnPageSelected: !allOnPageSelected && pageIds.some((id) => selection.has(id)),
    clearSelection: () => setSelection(new Set()),
    pagination,
    pageSize,
    setPageSize,
    getRowId,
  };
}

export type DataTableModel<T> = ReturnType<typeof useDataTable<T>>;
