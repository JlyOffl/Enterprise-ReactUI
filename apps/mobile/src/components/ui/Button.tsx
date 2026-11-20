import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@erui/core';
import { Icon, type IconKey } from './Icon';
import { Text } from './Typography';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'link';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ButtonProps {
  children?: ReactNode;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: IconKey;
  rightIcon?: IconKey;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

const HEIGHT: Record<ButtonSize, number> = { xs: 28, sm: 34, md: 44, lg: 52 };

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  loading,
  disabled,
  fullWidth,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const { colors, radii } = useTheme();
  const palette: Record<ButtonVariant, { bg: string; fg: string; border: string }> = {
    primary: { bg: colors.primary, fg: colors.primaryContrast, border: colors.primary },
    secondary: { bg: colors.surface, fg: colors.text, border: colors.border },
    outline: { bg: 'transparent', fg: colors.primary, border: colors.primary },
    ghost: { bg: 'transparent', fg: colors.textMuted, border: 'transparent' },
    danger: { bg: colors.danger, fg: '#fff', border: colors.danger },
    success: { bg: colors.success, fg: '#fff', border: colors.success },
    link: { bg: 'transparent', fg: colors.primary, border: 'transparent' },
  };
  const p = palette[variant];
  const iconSize = size === 'lg' ? 20 : size === 'xs' ? 14 : 17;
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        {
          height: variant === 'link' ? undefined : HEIGHT[size],
          paddingHorizontal: variant === 'link' ? 0 : size === 'xs' ? 10 : size === 'sm' ? 12 : 18,
          backgroundColor: p.bg,
          borderColor: p.border,
          borderRadius: size === 'xs' ? radii.sm : radii.md,
          opacity: isDisabled ? 0.55 : pressed ? 0.85 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
        fullWidth && styles.block,
        style,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={p.fg} /> : leftIcon && <Icon name={leftIcon} size={iconSize} color={p.fg} />}
      {children !== undefined && (
        <Text variant="label" style={{ color: p.fg, fontSize: size === 'lg' ? 16 : size === 'xs' ? 12 : 14 }}>
          {children}
        </Text>
      )}
      {rightIcon && !loading && <Icon name={rightIcon} size={iconSize} color={p.fg} />}
    </Pressable>
  );
}

export function IconButton({
  icon,
  label,
  onPress,
  variant = 'ghost',
  size = 'md',
  badge,
  disabled,
}: {
  icon: IconKey;
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  badge?: number;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  const dim = HEIGHT[size];
  const fg = variant === 'primary' || variant === 'danger' ? '#fff' : variant === 'outline' ? colors.primary : colors.text;
  const bg = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : variant === 'secondary' ? colors.surface : 'transparent';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={8}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.icon,
        {
          width: dim,
          height: dim,
          backgroundColor: pressed ? colors.surfaceAlt : bg,
          borderColor: variant === 'secondary' || variant === 'outline' ? colors.border : 'transparent',
          opacity: disabled ? 0.4 : 1,
        },
      ]}
    >
      <Icon name={icon} size={size === 'xs' || size === 'sm' ? 16 : 20} color={fg} />
      {!!badge && (
        <View style={[styles.badge, { backgroundColor: colors.danger }]}>
          <Text variant="caption" style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
            {badge > 99 ? '99+' : badge}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1 },
  block: { alignSelf: 'stretch' },
  icon: { alignItems: 'center', justifyContent: 'center', borderRadius: 10, borderWidth: 1 },
  badge: { position: 'absolute', top: 2, right: 0, minWidth: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
});
