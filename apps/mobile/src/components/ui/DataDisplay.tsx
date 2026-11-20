import type { ReactNode } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { initials, useTheme } from '@erui/core';
import { Icon, type IconKey } from './Icon';
import { Text } from './Typography';
import { toneColors, type Tone } from './Feedback';
import { shadow } from '../../theme/styles';

/* ------------------------------------------------------------------ Card */
export function Card({
  title,
  subtitle,
  actions,
  children,
  footer,
  padded = true,
  onPress,
  style,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  padded?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  const body = (
    <>
      {(title || actions) && (
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            {title && <Text variant="heading">{title}</Text>}
            {subtitle && <Text variant="caption" tone="muted">{subtitle}</Text>}
          </View>
          {actions}
        </View>
      )}
      <View style={padded ? styles.cardBody : undefined}>{children}</View>
      {footer && <View style={[styles.cardFooter, { borderTopColor: theme.colors.border, backgroundColor: theme.colors.surfaceAlt }]}>{footer}</View>}
    </>
  );
  const cardStyle = [
    styles.card,
    { backgroundColor: theme.colors.surface, borderColor: theme.colors.border, borderRadius: theme.radii.lg },
    shadow(theme, 'sm'),
    style,
  ];
  return onPress ? (
    <Pressable onPress={onPress} style={({ pressed }) => [cardStyle, pressed && { opacity: 0.9 }]}>
      {body}
    </Pressable>
  ) : (
    <View style={cardStyle}>{body}</View>
  );
}

/* ---------------------------------------------------------------- Avatar */
const AVATAR_COLORS = ['#6366f1', '#0ea5e9', '#14b8a6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#22c55e'];
const colorFor = (name: string) => AVATAR_COLORS[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % AVATAR_COLORS.length];

export function Avatar({ name, src, size = 40, status }: { name: string; src?: string; size?: number; status?: 'online' | 'away' | 'offline' }) {
  const { colors } = useTheme();
  const statusColor = status === 'online' ? colors.success : status === 'away' ? colors.warning : colors.textSubtle;
  return (
    <View style={{ width: size, height: size }} accessibilityLabel={name}>
      {src ? (
        <Image source={{ uri: src }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: colorFor(name) }]}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: size * 0.38 }}>{initials(name)}</Text>
        </View>
      )}
      {status && <View style={[styles.status, { backgroundColor: statusColor, borderColor: colors.surface, width: size * 0.3, height: size * 0.3, borderRadius: size * 0.15 }]} />}
    </View>
  );
}

export function AvatarGroup({ names, max = 4, size = 32 }: { names: string[]; max?: number; size?: number }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row' }}>
      {names.slice(0, max).map((n, i) => (
        <View key={n} style={{ marginLeft: i ? -8 : 0, borderRadius: size, borderWidth: 2, borderColor: colors.surface }}>
          <Avatar name={n} size={size} />
        </View>
      ))}
      {names.length > max && (
        <View style={[styles.avatar, { marginLeft: -8, width: size + 4, height: size + 4, borderRadius: size, backgroundColor: colors.surfaceAlt, borderWidth: 2, borderColor: colors.surface }]}>
          <Text variant="caption" tone="muted" weight="600">+{names.length - max}</Text>
        </View>
      )}
    </View>
  );
}

/* -------------------------------------------------------------- StatCard */
export function StatCard({ label, value, change, trend, icon }: { label: string; value: ReactNode; change?: string; trend?: 'up' | 'down'; icon?: IconKey }) {
  const { colors } = useTheme();
  return (
    <Card style={{ flex: 1, minWidth: 150 }}>
      <View style={{ gap: 6 }}>
        <View style={styles.rowBetween}>
          <Text variant="caption" tone="muted" weight="500">{label}</Text>
          {icon && (
            <View style={[styles.statIcon, { backgroundColor: colors.primarySoft }]}>
              <Icon name={icon} size={16} color={colors.primary} />
            </View>
          )}
        </View>
        <Text variant="title" style={{ textTransform: 'capitalize' }}>{value}</Text>
        {change && (
          <View style={{ flexDirection: 'row', gap: 4, alignItems: 'center' }}>
            <Icon name={trend === 'down' ? 'trendDown' : 'trendUp'} size={14} color={trend === 'down' ? colors.danger : colors.success} />
            <Text variant="caption" tone={trend === 'down' ? 'danger' : 'success'} weight="600">{change}</Text>
          </View>
        )}
      </View>
    </Card>
  );
}

/* -------------------------------------------------------------- Timeline */
export function Timeline({ items }: { items: Array<{ id: string; title: ReactNode; description?: ReactNode; at?: ReactNode; tone?: Tone }> }) {
  const theme = useTheme();
  return (
    <View>
      {items.map((item, i) => (
        <View key={item.id} style={styles.tlItem}>
          <View style={{ alignItems: 'center' }}>
            <View style={[styles.tlDot, { backgroundColor: toneColors(theme, item.tone ?? 'neutral').fg }]} />
            {i < items.length - 1 && <View style={[styles.tlLine, { backgroundColor: theme.colors.border }]} />}
          </View>
          <View style={{ flex: 1, paddingBottom: 16, gap: 2 }}>
            <View style={styles.rowBetween}>
              {typeof item.title === 'string' ? <Text weight="500" style={{ flex: 1 }}>{item.title}</Text> : <View style={{ flex: 1 }}>{item.title}</View>}
              {item.at && <Text variant="caption" tone="muted">{item.at}</Text>}
            </View>
            {item.description && <Text variant="caption" tone="muted">{item.description}</Text>}
          </View>
        </View>
      ))}
    </View>
  );
}

/* --------------------------------------------------------------- Divider */
export function Divider({ label }: { label?: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.divider}>
      <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
      {label && <Text variant="caption" tone="subtle" style={{ textTransform: 'uppercase' }}>{label}</Text>}
      {label && <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />}
    </View>
  );
}

/* ------------------------------------------------------- DescriptionList */
export function DescriptionList({ items }: { items: Array<{ label: string; value: ReactNode }> }) {
  const { colors } = useTheme();
  return (
    <View>
      {items.map((item, i) => (
        <View key={i} style={[styles.dlRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]}>
          <Text variant="caption" tone="muted">{item.label}</Text>
          {typeof item.value === 'string' || typeof item.value === 'number' ? (
            <Text weight="500" style={{ flexShrink: 1, textAlign: 'right' }}>{item.value}</Text>
          ) : (
            item.value
          )}
        </View>
      ))}
    </View>
  );
}

export function CodeBlock({ code, maxHeight = 240 }: { code: string; maxHeight?: number }) {
  return (
    <ScrollView style={[styles.code, { maxHeight }]} nestedScrollEnabled>
      <Text variant="mono" style={{ color: '#e2e8f0' }}>{code}</Text>
    </ScrollView>
  );
}

/* --------------------------------------------------------------- BarList */
export function BarList({ items }: { items: Array<{ id: string; label: string; value: ReactNode; ratio: number; tone?: Tone }> }) {
  const theme = useTheme();
  return (
    <View style={{ gap: 12 }}>
      {items.map((i) => (
        <View key={i.id} style={{ gap: 4 }}>
          <View style={styles.rowBetween}>
            <Text>{i.label}</Text>
            <Text tone="muted">{i.value}</Text>
          </View>
          <View style={[styles.barTrack, { backgroundColor: theme.colors.surfaceAlt }]}>
            <View style={[styles.barFill, { width: `${Math.max(2, i.ratio * 100)}%`, backgroundColor: toneColors(theme, i.tone ?? 'primary').fg }]} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function ColumnChart({ points, height = 160 }: { points: Array<{ label: string; ratio: number; formatted: string }>; height?: number }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.chart, { height }]}>
      {points.map((p) => (
        <View key={p.label} style={styles.chartCol} accessibilityLabel={`${p.label} ${p.formatted}`}>
          <View style={[styles.chartBar, { height: `${Math.max(4, p.ratio * 85)}%`, backgroundColor: colors.primary }]} />
          <Text variant="caption" tone="muted">{p.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, overflow: 'visible' },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingHorizontal: 16, paddingTop: 16 },
  cardBody: { padding: 16 },
  cardFooter: { paddingHorizontal: 16, paddingVertical: 12, borderTopWidth: StyleSheet.hairlineWidth },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  status: { position: 'absolute', right: -1, bottom: -1, borderWidth: 2 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  statIcon: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  tlItem: { flexDirection: 'row', gap: 12 },
  tlDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  tlLine: { width: 2, flex: 1, marginTop: 2 },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 12 },
  dividerLine: { flex: 1, height: StyleSheet.hairlineWidth },
  dlRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, gap: 16 },
  code: { backgroundColor: '#0f172a', borderRadius: 10, padding: 12 },
  barTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  chartCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 6, height: '100%' },
  chartBar: { width: '100%', borderTopLeftRadius: 8, borderTopRightRadius: 8, borderBottomLeftRadius: 3, borderBottomRightRadius: 3 },
});
