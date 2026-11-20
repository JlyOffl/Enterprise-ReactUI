import type { ReactNode } from 'react';
import { Text as RNText, type StyleProp, type TextStyle } from 'react-native';
import { useTheme } from '@erui/core';

export type TextVariant = 'display' | 'title' | 'heading' | 'body' | 'label' | 'caption' | 'mono';
export type TextTone = 'default' | 'muted' | 'subtle' | 'primary' | 'success' | 'warning' | 'danger' | 'inverse';

export function Text({
  children,
  variant = 'body',
  tone = 'default',
  weight,
  align,
  numberOfLines,
  style,
}: {
  children?: ReactNode;
  variant?: TextVariant;
  tone?: TextTone;
  weight?: '400' | '500' | '600' | '700';
  align?: TextStyle['textAlign'];
  numberOfLines?: number;
  style?: StyleProp<TextStyle>;
}) {
  const { colors, typography } = useTheme();
  const toneColor: Record<TextTone, string> = {
    default: colors.text,
    muted: colors.textMuted,
    subtle: colors.textSubtle,
    primary: colors.primary,
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
    inverse: colors.primaryContrast,
  };
  const variants: Record<TextVariant, TextStyle> = {
    display: { fontSize: typography.size.xxxl, fontWeight: '700', letterSpacing: -0.5 },
    title: { fontSize: typography.size.xxl, fontWeight: '700', letterSpacing: -0.3 },
    heading: { fontSize: typography.size.lg, fontWeight: '600' },
    body: { fontSize: typography.size.md, lineHeight: 20 },
    label: { fontSize: typography.size.sm, fontWeight: '600' },
    caption: { fontSize: typography.size.xs, lineHeight: 16 },
    mono: { fontSize: typography.size.xs, fontFamily: 'Menlo' },
  };
  return (
    <RNText
      numberOfLines={numberOfLines}
      style={[variants[variant], { color: toneColor[tone], textAlign: align }, weight && { fontWeight: weight }, style]}
    >
      {children}
    </RNText>
  );
}
