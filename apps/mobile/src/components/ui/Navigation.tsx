import { useState, type ReactNode } from 'react';
import { LayoutAnimation, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useAccordion, useTabs, useTheme, type PageItem } from '@erui/core';
import { Icon, type IconKey } from './Icon';
import { Text } from './Typography';
import { Sheet } from './Sheet';

/* -------------------------------------------------------------------- Tabs */
export interface TabDef {
  id: string;
  label: string;
  icon?: IconKey;
  badge?: number | string;
  disabled?: boolean;
}

export function Tabs({ items, value, onChange, variant = 'line' }: { items: TabDef[]; value: string; onChange: (id: string) => void; variant?: 'line' | 'pill' }) {
  const tabs = useTabs({ items, value, onChange });
  const { colors, radii } = useTheme();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      accessibilityRole="tablist"
      contentContainerStyle={[
        styles.tabs,
        variant === 'line' ? { borderBottomWidth: 1, borderBottomColor: colors.border } : { backgroundColor: colors.surfaceAlt, borderRadius: radii.md, padding: 3 },
      ]}
    >
      {items.map((t) => {
        const active = tabs.isSelected(t.id);
        return (
          <Pressable
            key={t.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: active, disabled: t.disabled }}
            disabled={t.disabled}
            onPress={() => tabs.select(t.id)}
            style={[
              styles.tab,
              variant === 'line' && active && { borderBottomColor: colors.primary },
              variant === 'line' && { borderBottomWidth: 2, borderBottomColor: active ? colors.primary : 'transparent' },
              variant === 'pill' && active && { backgroundColor: colors.surface, borderRadius: radii.sm },
              t.disabled && { opacity: 0.4 },
            ]}
          >
            {t.icon && <Icon name={t.icon} size={16} color={active ? colors.primary : colors.textMuted} />}
            <Text variant="label" style={{ color: active ? (variant === 'line' ? colors.primary : colors.text) : colors.textMuted }}>
              {t.label}
            </Text>
            {t.badge !== undefined && (
              <View style={[styles.tabBadge, { backgroundColor: active ? colors.primarySoft : colors.surfaceAlt }]}>
                <Text variant="caption" weight="600" tone={active ? 'primary' : 'muted'}>{t.badge}</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/* ------------------------------------------------------------- Breadcrumbs */
export function Breadcrumbs({ items }: { items: Array<{ label: string; onPress?: () => void }> }) {
  const { colors } = useTheme();
  return (
    <View style={styles.crumbs} accessibilityLabel="Breadcrumb">
      {items.map((item, i) => (
        <View key={i} style={styles.crumbs}>
          {i < items.length - 1 ? (
            <>
              <Pressable onPress={item.onPress}>
                <Text tone="muted">{item.label}</Text>
              </Pressable>
              <Icon name="chevronRight" size={14} color={colors.textSubtle} />
            </>
          ) : (
            <Text weight="600">{item.label}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

/* -------------------------------------------------------------- Pagination */
export function Pagination({ model }: { model: { page: number; pageCount: number; items: PageItem[]; setPage(p: number): void; next(): void; prev(): void; canNext: boolean; canPrev: boolean } }) {
  const { colors } = useTheme();
  return (
    <View style={styles.pagination}>
      <Pressable accessibilityLabel="Previous page" disabled={!model.canPrev} onPress={model.prev} style={[styles.pageBtn, { opacity: model.canPrev ? 1 : 0.4 }]}>
        <Icon name="chevronLeft" size={18} />
      </Pressable>
      {model.items.map((item, i) =>
        typeof item === 'number' ? (
          <Pressable key={i} onPress={() => model.setPage(item)} style={[styles.pageBtn, item === model.page && { backgroundColor: colors.primary }]}>
            <Text weight="600" tone={item === model.page ? 'inverse' : 'default'}>{item}</Text>
          </Pressable>
        ) : (
          <Text key={i} tone="subtle">…</Text>
        ),
      )}
      <Pressable accessibilityLabel="Next page" disabled={!model.canNext} onPress={model.next} style={[styles.pageBtn, { opacity: model.canNext ? 1 : 0.4 }]}>
        <Icon name="chevronRight" size={18} />
      </Pressable>
    </View>
  );
}

/* ----------------------------------------------------------------- Stepper */
export function Stepper({ steps, statusOf, onStepPress }: { steps: Array<{ id: string; label: string }>; statusOf: (i: number) => 'complete' | 'current' | 'upcoming'; onStepPress?: (i: number) => void }) {
  const { colors } = useTheme();
  return (
    <View style={styles.steps}>
      {steps.map((s, i) => {
        const status = statusOf(i);
        const done = status === 'complete';
        const current = status === 'current';
        return (
          <View key={s.id} style={styles.step}>
            <Pressable
              disabled={!onStepPress}
              onPress={() => onStepPress?.(i)}
              style={[
                styles.marker,
                { borderColor: done || current ? colors.primary : colors.borderStrong, backgroundColor: done ? colors.primary : colors.surface },
              ]}
            >
              {done ? <Icon name="check" size={14} color="#fff" /> : <Text variant="caption" weight="700" tone={current ? 'primary' : 'muted'}>{i + 1}</Text>}
            </Pressable>
            <Text variant="caption" weight={current ? '700' : '500'} tone={current ? 'default' : 'muted'} numberOfLines={1}>
              {s.label}
            </Text>
            {i < steps.length - 1 && <View style={[styles.connector, { backgroundColor: done ? colors.primary : colors.border }]} />}
          </View>
        );
      })}
    </View>
  );
}

/* --------------------------------------------------------------- Accordion */
export function Accordion({ items, multiple, defaultExpanded }: { items: Array<{ id: string; title: string; subtitle?: string; content: ReactNode; icon?: IconKey }>; multiple?: boolean; defaultExpanded?: string[] }) {
  const acc = useAccordion({ multiple, defaultExpanded });
  const { colors, radii } = useTheme();
  return (
    <View style={{ borderWidth: 1, borderColor: colors.border, borderRadius: radii.lg, overflow: 'hidden', backgroundColor: colors.surface }}>
      {items.map((item, i) => {
        const open = acc.isExpanded(item.id);
        return (
          <View key={item.id} style={i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: open }}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                acc.toggle(item.id);
              }}
              style={styles.accTrigger}
            >
              {item.icon && <Icon name={item.icon} size={18} color={colors.textMuted} />}
              <View style={{ flex: 1 }}>
                <Text weight="600">{item.title}</Text>
                {item.subtitle && <Text variant="caption" tone="muted">{item.subtitle}</Text>}
              </View>
              <Icon name={open ? 'chevronUp' : 'chevronDown'} size={18} color={colors.textMuted} />
            </Pressable>
            {open && <View style={styles.accPanel}>{typeof item.content === 'string' ? <Text tone="muted">{item.content}</Text> : item.content}</View>}
          </View>
        );
      })}
    </View>
  );
}

/* -------------------------------------------------------------- ActionMenu */
export interface MenuItemDef {
  id: string;
  label: string;
  icon?: IconKey;
  danger?: boolean;
  disabled?: boolean;
  onSelect?: () => void;
}

/** Mobile equivalent of a dropdown menu: an action sheet. */
export function ActionMenu({ trigger, items, title }: { trigger: (open: () => void) => ReactNode; items: MenuItemDef[]; title?: string }) {
  const [open, setOpen] = useState(false);
  const { colors } = useTheme();
  return (
    <>
      {trigger(() => setOpen(true))}
      <Sheet visible={open} onClose={() => setOpen(false)} title={title} heightRatio={0.5}>
        {items.map((item) => (
          <Pressable
            key={item.id}
            disabled={item.disabled}
            onPress={() => {
              setOpen(false);
              item.onSelect?.();
            }}
            style={({ pressed }) => [styles.menuItem, { backgroundColor: pressed ? colors.surfaceAlt : 'transparent', opacity: item.disabled ? 0.4 : 1 }]}
          >
            {item.icon && <Icon name={item.icon} size={20} color={item.danger ? colors.danger : colors.text} />}
            <Text tone={item.danger ? 'danger' : 'default'} weight="500">{item.label}</Text>
          </Pressable>
        ))}
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', gap: 4 },
  tab: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 10 },
  tabBadge: { minWidth: 20, paddingHorizontal: 6, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  crumbs: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  pagination: { flexDirection: 'row', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  pageBtn: { minWidth: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  steps: { flexDirection: 'row' },
  step: { flex: 1, alignItems: 'center', gap: 6, position: 'relative' },
  marker: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  connector: { position: 'absolute', top: 14, left: '60%', right: '-40%', height: 2 },
  accTrigger: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  accPanel: { paddingHorizontal: 14, paddingBottom: 14 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 16 },
});
