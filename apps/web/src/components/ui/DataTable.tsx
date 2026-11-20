import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { DataTableModel } from '@erui/core';
import { Checkbox } from './FormControls';
import { Pagination } from './Navigation';
import { EmptyState, Skeleton } from './Feedback';
import { Icon } from './Icon';
import { cx } from './cx';

export interface DataTableProps<T> {
  table: DataTableModel<T>;
  renderCell?: (row: T, columnId: string) => ReactNode;
  /** Visible column ids (defaults to all). */
  visibleColumns?: string[];
  selectable?: boolean;
  loading?: boolean;
  rowActions?: (row: T) => ReactNode;
  onRowClick?: (row: T) => void;
  emptyTitle?: ReactNode;
  toolbar?: ReactNode;
  dense?: boolean;
}

/** Enterprise data grid: sortable headers, selection, sticky header, pagination, page size. */
export function DataTable<T>({
  table,
  renderCell,
  visibleColumns,
  selectable,
  loading,
  rowActions,
  onRowClick,
  emptyTitle,
  toolbar,
  dense,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const columns = visibleColumns ? table.columns.filter((c) => visibleColumns.includes(c.id)) : table.columns;
  const { range } = table.pagination;

  return (
    <div className="table-wrap">
      {toolbar && <div className="table-toolbar">{toolbar}</div>}
      <div className="table-scroll">
        <table className={cx('table', dense && 'table--dense')}>
          <thead>
            <tr>
              {selectable && (
                <th className="table__select">
                  <Checkbox
                    checked={table.allOnPageSelected}
                    indeterminate={table.someOnPageSelected}
                    onChange={table.toggleAllOnPage}
                  />
                </th>
              )}
              {columns.map((col) => {
                const dir = table.sortDirectionOf(col.id);
                return (
                  <th
                    key={col.id}
                    style={{ width: col.width, textAlign: col.align }}
                    aria-sort={dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : undefined}
                  >
                    {col.sortable ? (
                      <button type="button" className={cx('table__sort', dir && 'is-sorted')} onClick={() => table.toggleSort(col.id)}>
                        {t(col.header)}
                        <Icon name={dir === 'asc' ? 'sortAsc' : dir === 'desc' ? 'sortDesc' : 'sort'} size={13} />
                      </button>
                    ) : (
                      t(col.header)
                    )}
                  </th>
                );
              })}
              {rowActions && <th className="table__actions" />}
            </tr>
          </thead>
          <tbody>
            {loading &&
              Array.from({ length: 5 }, (_, i) => (
                <tr key={`sk-${i}`}>
                  {selectable && <td />}
                  {columns.map((c) => (
                    <td key={c.id}>
                      <Skeleton height={12} />
                    </td>
                  ))}
                  {rowActions && <td />}
                </tr>
              ))}
            {!loading &&
              table.rows.map((row) => {
                const id = table.getRowId(row);
                const selected = table.isSelected(id);
                return (
                  <tr
                    key={id}
                    className={cx(selected && 'is-selected', onRowClick && 'is-clickable')}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {selectable && (
                      <td className="table__select" onClick={(e) => e.stopPropagation()}>
                        <Checkbox checked={selected} onChange={() => table.toggleRow(id)} />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.id} style={{ textAlign: col.align }}>
                        {renderCell ? renderCell(row, col.id) : String(col.accessor(row) ?? '')}
                      </td>
                    ))}
                    {rowActions && (
                      <td className="table__actions" onClick={(e) => e.stopPropagation()}>
                        {rowActions(row)}
                      </td>
                    )}
                  </tr>
                );
              })}
          </tbody>
        </table>
        {!loading && table.rows.length === 0 && <EmptyState icon="search" title={emptyTitle ?? t('common.noResults')} />}
      </div>
      <div className="table-footer">
        <span className="text-muted text-sm">
          {table.selectedCount > 0 && <strong>{t('common.selected', { count: table.selectedCount })} · </strong>}
          {t('common.showing', { from: range.from, to: range.to, total: range.total })}
        </span>
        <div className="row gap-md">
          <label className="text-muted text-sm row gap-xs">
            {t('common.rowsPerPage')}
            <select className="native-select" value={table.pageSize} onChange={(e) => table.setPageSize(Number(e.target.value))}>
              {[5, 8, 10, 20, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </label>
          <Pagination model={table.pagination} />
        </div>
      </div>
    </div>
  );
}
