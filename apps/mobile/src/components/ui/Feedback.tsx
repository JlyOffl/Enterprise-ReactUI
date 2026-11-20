import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, Animated, Pressable, StyleSheet, View, type DimensionValue } from 'react-native';
import { useTheme, type Theme } from '@erui/core';
import { Icon, type IconKey } from './Icon';
import { Text } from './Typography';

export type Tone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

export function toneColors(theme: Theme, tone: Tone): { fg: string; bg: string } {
  const c = theme.colors;
  switch (tone) {
    case 'primary':
      return { fg: c.primary, bg: c.primarySoft };
    case 'success':
      return { fg: c.success, bg: c.successSoft };
    case 'warning':
      return { fg: c.warning, bg: c.warningSoft };
    case 'danger':
      return { fg: c.danger, bg: c.dangerSoft };
    case 'info':
      return { fg: c.info, bg: c.infoSoft };
    default:
      return { fg: c.textMuted, bg: c.surfaceAlt };
  }
}

/* ------------------------------------------------------------------ Alert */
const alertIcon: Record<'info' | 'success' | 'warning' | 'danger', IconKey> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  danger: 'error',
};

export function Alert({
  tone = 'info',
  title,
  children,
  onClose,
  action,
}: {
  tone?: 'info' | 'success' | 'warning' | 'danger';
  title?: ReactNode;
  children?: ReactNode;
  onClose?: () => void;
  action?: ReactNode;
}) {
  const theme = useTheme();
  const { fg, bg } = toneColors(theme, tone);
  return (
    <View accessibilityRole="alert" style={[styles.alert, { backgroundColor: bg, borderColor: fg + '40', borderRadius: theme.radii.md }]}>
      <Icon name={alertIcon[tone]} size={20} color={fg} />
      <View style={styles.flex}>
        {title && <Text variant="label">{title}</Text>}
        {children && (typeof children === 'string' ? <Text tone="muted">{children}</Text> : children)}
        {action && <View style={{ marginTop: 8, flexDirection: 'row' }}>{action}</View>}
      </View>
      {onClose && (
        <Pressable onPress={onClose} hitSlop={8} accessibilityLabel="Dismiss">
          <Icon name="x" size={16} color={theme.colors.textMuted} />
        </Pressable>
      )}
    </View>
  );
}

/* ------------------------------------------------------------------ Badge */
export function Badge({
  tone = 'neutral',
  variant = 'soft',
  dot,
  icon,
  children,
}: {
  tone?: Tone;
  variant?: 'soft' | 'solid' | 'outline';
  dot?: boolean;
  icon?: IconKey;
  children: ReactNode;
}) {
  const theme = useTheme();
  const { fg, bg } = toneColors(theme, tone);
  const color = variant === 'solid' ? '#fff' : fg;
  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: variant === 'solid' ? fg : variant === 'outline' ? 'transparent' : bg,
          borderColor: variant === 'outline' ? fg : 'transparent',
        },
      ]}
    >
      {dot && <View style={[styles.dot, { backgroundColor: color }]} />}
      {icon && <Icon name={icon} size={12} color={color} />}
      <Text variant="caption" weight="600" style={{ color, textTransform: 'capitalize' }}>
        {children}
      </Text>
    </View>
  );
}

/* ------------------------------------------------------------------- Chip */
export function Chip({
  label,
  selected,
  onPress,
  onRemove,
  icon,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  onRemove?: () => void;
  icon?: IconKey;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={{ selected }}
      style={[
        styles.chip,
        {
          borderColor: selected ? colors.primary : colors.border,
          backgroundColor: selected ? colors.primarySoft : colors.surface,
        },
      ]}
    >
      {selected && onPress ? <Icon name="check" size={14} color={colors.primary} /> : icon && <Icon name={icon} size={14} color={colors.textMuted} />}
      <Text variant="label" style={{ color: selected ? colors.primary : colors.text, fontWeight: '500' }}>
        {label}
      </Text>
      {onRemove && (
        <Pressable onPress={onRemove} hitSlop={8} accessibilityLabel={`Remove ${label}`}>
          <Icon name="x" size={14} color={colors.textMuted} />
        </Pressable>
      )}
    </Pressable>
  );
}

/* ---------------------------------------------------------------- Spinner */
export function Spinner({ size = 'small' }: { size?: 'small' | 'large' }) {
  const { colors } = useTheme();
  return <ActivityIndicator size={size} color={colors.primary} />;
}

/* -------------------------------------------------------------- Progress */
export function ProgressBar({
  value = 0,
  max = 100,
  tone = 'primary',
  label,
  showValue,
  indeterminate,
  height = 8,
}: {
  value?: number;
  max?: number;
  tone?: Tone;
  label?: string;
  showValue?: boolean;
  indeterminate?: boolean;
  height?: number;
}) {
  const theme = useTheme();
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!indeterminate) return;
    const loop = Animated.loop(Animated.timing(anim, { toValue: 1, duration: 1200, useNativeDriver: false }));
    loop.start();
    return () => loop.stop();
  }, [indeterminate, anim]);
  return (
    <View style={{ gap: 6 }}>
      {(label || showValue) && (
        <View style={styles.rowBetween}>
          <Text variant="label">{label}</Text>
          {showValue && <Text variant="caption" tone="muted">{Math.round(pct)}%</Text>}
        </View>
      )}
      <View accessibilityRole="progressbar" style={[styles.track, { height, backgroundColor: theme.colors.surfaceAlt }]}>
        {indeterminate ? (
          <Animated.View
            style={[
              styles.bar,
              {
                width: '35%',
                backgroundColor: toneColors(theme, tone).fg,
                left: anim.interpolate({ inputRange: [0, 1], outputRange: ['-35%', '100%'] }),
              },
            ]}
          />
        ) : (
          <View style={[styles.bar, { width: `${pct}%`, backgroundColor: toneColors(theme, tone).fg }]} />
        )}
      </View>
    </View>
  );
}

/* --------------------------------------------------------------- Skeleton */
export function Skeleton({
  width = '100%',
  height = 14,
  radius = 6,
  lines = 1,
}: {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  lines?: number;
}) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return (
    <View style={{ gap: 8 }}>
      {Array.from({ length: lines }, (_, i) => (
        <Animated.View
          key={i}
          style={{ width: lines > 1 && i === lines - 1 ? '60%' : width, height, borderRadius: radius, backgroundColor: colors.skeleton, opacity }}
        />
      ))}
    </View>
  );
}

/* ---------------------------------------------------------------- Tooltip */
/** Mobile tooltip: long-press to reveal (hover does not exist on touch). */
export function Tooltip({ content, children }: { content: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { colors } = useTheme();
  return (
    <Pressable onLongPress={() => setOpen(true)} onPressOut={() => setOpen(false)} delayLongPress={250}>
      {children}
      {open && (
        <View style={[styles.tooltip, { backgroundColor: colors.text }]}>
          <Text variant="caption" style={{ color: colors.background }}>
            {content}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

/* ------------------------------------------------------------- EmptyState */
export function EmptyState({ icon = 'folder', title, description, action }: { icon?: IconKey; title: string; description?: string; action?: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.surfaceAlt }]}>
        <Icon name={icon} size={24} color={colors.textMuted} />
      </View>
      <Text variant="heading" align="center">
        {title}
      </Text>
      {description && (
        <Text tone="muted" align="center">
          {description}
        </Text>
      )}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, gap: 2 },
  alert: { flexDirection: 'row', gap: 12, padding: 12, borderWidth: 1, alignItems: 'flex-start' },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, height: 22, borderRadius: 11, borderWidth: 1, alignSelf: 'flex-start' },
  dot: { width: 6, height: 6, borderRadius: 3 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, height: 32, borderRadius: 16, borderWidth: 1 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  track: { borderRadius: 999, overflow: 'hidden', position: 'relative' },
  bar: { height: '100%', borderRadius: 999, position: 'absolute', left: 0, top: 0 },
  tooltip: { position: 'absolute', bottom: '110%', alignSelf: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, zIndex: 10 },
  empty: { alignItems: 'center', gap: 8, padding: 32 },
  emptyIcon: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
