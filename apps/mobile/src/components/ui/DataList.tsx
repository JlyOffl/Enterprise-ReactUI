import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme, type DataTableModel } from '@erui/core';
import { Checkbox, TextField } from './FormControls';
import { Pagination } from './Navigation';
import { EmptyState, Skeleton } from './Feedback';
import { Icon } from './Icon';
import { Text } from './Typography';

/**
 * Mobile data grid: the same headless table model as the web DataTable, rendered as a card list
 * with search, sort chips, selection and pagination. Rows are rendered inline (pages are small),
 * so it can live inside a ScrollView.
 */
export function DataList<T>({
  table,
  renderItem,
  selectable,
  loading,
  onItemPress,
  searchPlaceholder,
  headerRight,
  sortableColumns,
}: {
  table: DataTableModel<T>;
  renderItem: (row: T) => ReactNode;
  selectable?: boolean;
  loading?: boolean;
  onItemPress?: (row: T) => void;
  searchPlaceholder?: string;
  headerRight?: ReactNode;
  sortableColumns?: string[];
}) {
  const { t } = useTranslation();
  const { colors, radii } = useTheme();
  const sortable = table.columns.filter((c) => c.sortable && (!sortableColumns || sortableColumns.includes(c.id)));
  const { range } = table.pagination;

  return (
    <View style={{ gap: 12 }}>
      <TextField leftIcon="search" placeholder={searchPlaceholder ?? t('common.search')} value={table.search} onChangeText={table.setSearch} clearButtonMode="while-editing" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {sortable.map((c) => {
          const dir = table.sortDirectionOf(c.id);
          return (
            <Pressable
              key={c.id}
              onPress={() => table.toggleSort(c.id)}
              style={[styles.sortChip, { borderColor: dir ? colors.primary : colors.border, backgroundColor: dir ? colors.primarySoft : colors.surface }]}
            >
              <Text variant="caption" weight="600" tone={dir ? 'primary' : 'muted'}>{t(c.header)}</Text>
              <Icon name={dir === 'asc' ? 'sortAsc' : dir === 'desc' ? 'sortDesc' : 'sort'} size={12} color={dir ? colors.primary : colors.textSubtle} />
            </Pressable>
          );
        })}
      </ScrollView>
      {(selectable || headerRight) && (
        <View style={styles.rowBetween}>
          {selectable ? <Checkbox label={t('common.selected', { count: table.selectedCount })} checked={table.allOnPageSelected} indeterminate={table.someOnPageSelected} onChange={table.toggleAllOnPage} /> : <View />}
          {headerRight}
        </View>
      )}

      {loading && Array.from({ length: 4 }, (_, i) => <Skeleton key={i} height={64} radius={radii.lg} />)}
      {!loading && table.rows.length === 0 && <EmptyState icon="search" title={t('common.noResults')} />}
      {!loading &&
        table.rows.map((row) => {
          const id = table.getRowId(row);
          const selected = table.isSelected(id);
          return (
            <Pressable
              key={id}
              onPress={onItemPress ? () => onItemPress(row) : undefined}
              onLongPress={selectable ? () => table.toggleRow(id) : undefined}
              style={({ pressed }) => [
                styles.item,
                {
                  backgroundColor: selected ? colors.primarySoft : colors.surface,
                  borderColor: selected ? colors.primary : colors.border,
                  borderRadius: radii.lg,
                  opacity: pressed ? 0.9 : 1,
                },
              ]}
            >
              {selectable && <Checkbox checked={selected} onChange={() => table.toggleRow(id)} />}
              <View style={{ flex: 1 }}>{renderItem(row)}</View>
            </Pressable>
          );
        })}

      <View style={[styles.rowBetween, { flexWrap: 'wrap', gap: 8 }]}>
        <Text variant="caption" tone="muted">{t('common.showing', { from: range.from, to: range.to, total: range.total })}</Text>
        <Pagination model={table.pagination} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sortChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, height: 30, borderRadius: 15, borderWidth: 1 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderWidth: 1 },
});
