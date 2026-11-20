import { useState, type ReactNode, type Ref } from 'react';
import { Pressable, Switch as RNSwitch, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import RNSlider from '@react-native-community/slider';
import { useCounter, useTheme, type SelectOption } from '@erui/core';
import { Icon, type IconKey } from './Icon';
import { Text } from './Typography';

/* ------------------------------------------------------------------ Field */
export function Field({
  label,
  required,
  helperText,
  error,
  trailing,
  children,
}: {
  label?: ReactNode;
  required?: boolean;
  helperText?: ReactNode;
  error?: string;
  trailing?: ReactNode;
  children: ReactNode;
}) {
  return (
    <View style={styles.field}>
      {label !== undefined && (
        <View style={styles.labelRow}>
          <Text variant="label">
            {label}
            {required && <Text tone="danger"> *</Text>}
          </Text>
          {trailing}
        </View>
      )}
      {children}
      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : (
        helperText && (
          <Text variant="caption" tone="muted">
            {helperText}
          </Text>
        )
      )}
    </View>
  );
}

/* -------------------------------------------------------------- TextField */
export interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  leftIcon?: IconKey;
  rightElement?: ReactNode;
  ref?: Ref<TextInput>;
}

export function TextField({ label, helperText, error, required, leftIcon, rightElement, multiline, ref, onFocus, onBlur, ...rest }: TextFieldProps) {
  const { colors, radii } = useTheme();
  const [focused, setFocused] = useState(false);
  return (
    <Field label={label} required={required} helperText={helperText} error={error}>
      <View
        style={[
          styles.input,
          {
            borderColor: error ? colors.danger : focused ? colors.primary : colors.borderStrong,
            backgroundColor: rest.editable === false ? colors.surfaceAlt : colors.surface,
            borderRadius: radii.md,
            minHeight: multiline ? 96 : 46,
            alignItems: multiline ? 'flex-start' : 'center',
          },
          focused && { shadowColor: colors.primary, shadowOpacity: 0.25, shadowRadius: 4, shadowOffset: { width: 0, height: 0 } },
        ]}
      >
        {leftIcon && <Icon name={leftIcon} size={18} color={colors.textSubtle} />}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textSubtle}
          multiline={multiline}
          textAlignVertical={multiline ? 'top' : 'center'}
          accessibilityLabel={label}
          style={[styles.inputText, { color: colors.text, paddingVertical: multiline ? 10 : 0 }]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
          {...rest}
        />
        {rightElement}
      </View>
    </Field>
  );
}

export function TextArea(props: TextFieldProps & { showCount?: boolean }) {
  const { showCount, maxLength, value, ...rest } = props;
  return (
    <View>
      <TextField multiline numberOfLines={4} maxLength={maxLength} value={value} {...rest} />
      {showCount && maxLength && (
        <Text variant="caption" tone="subtle" align="right">
          {(value ?? '').length}/{maxLength}
        </Text>
      )}
    </View>
  );
}

/* ---------------------------------------------------------------- Checkbox */
export function Checkbox({
  label,
  description,
  checked,
  indeterminate,
  onChange,
  disabled,
  error,
}: {
  label?: string;
  description?: string;
  checked: boolean;
  indeterminate?: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  error?: string;
}) {
  const { colors } = useTheme();
  const on = checked || indeterminate;
  return (
    <View>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: indeterminate ? 'mixed' : checked, disabled }}
        disabled={disabled}
        onPress={() => onChange(!checked)}
        style={[styles.checkRow, disabled && { opacity: 0.5 }]}
      >
        <View style={[styles.box, { borderColor: on ? colors.primary : colors.borderStrong, backgroundColor: on ? colors.primary : colors.surface }]}>
          {indeterminate ? <Icon name="minus" size={14} color="#fff" /> : checked && <Icon name="check" size={14} color="#fff" />}
        </View>
        {label && (
          <View style={{ flex: 1 }}>
            <Text weight="500">{label}</Text>
            {description && <Text variant="caption" tone="muted">{description}</Text>}
          </View>
        )}
      </Pressable>
      {error && <Text variant="caption" tone="danger">{error}</Text>}
    </View>
  );
}

/* -------------------------------------------------------------- RadioGroup */
export function RadioGroup({
  label,
  options,
  value,
  onChange,
  variant = 'default',
  error,
  required,
}: {
  label?: string;
  options: SelectOption[];
  value: string;
  onChange: (v: string) => void;
  variant?: 'default' | 'card';
  error?: string;
  required?: boolean;
}) {
  const { colors, radii } = useTheme();
  return (
    <Field label={label} error={error} required={required}>
      <View accessibilityRole="radiogroup" style={{ gap: 8 }}>
        {options.map((o) => {
          const checked = o.value === value;
          return (
            <Pressable
              key={o.value}
              accessibilityRole="radio"
              accessibilityState={{ checked, disabled: o.disabled }}
              disabled={o.disabled}
              onPress={() => onChange(o.value)}
              style={[
                styles.checkRow,
                variant === 'card' && {
                  padding: 12,
                  borderWidth: 1,
                  borderRadius: radii.md,
                  borderColor: checked ? colors.primary : colors.border,
                  backgroundColor: checked ? colors.primarySoft : colors.surface,
                },
                o.disabled && { opacity: 0.5 },
              ]}
            >
              <View style={[styles.radio, { borderColor: checked ? colors.primary : colors.borderStrong, borderWidth: checked ? 6 : 1.5 }]} />
              <View style={{ flex: 1 }}>
                <Text weight="500">{o.label}</Text>
                {o.description && <Text variant="caption" tone="muted">{o.description}</Text>}
              </View>
            </Pressable>
          );
        })}
      </View>
    </Field>
  );
}

/* ------------------------------------------------------------------ Switch */
export function Switch({
  label,
  description,
  checked,
  onChange,
  disabled,
}: {
  label?: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.switchRow, disabled && { opacity: 0.5 }]}>
      {label && (
        <View style={{ flex: 1 }}>
          <Text weight="500">{label}</Text>
          {description && <Text variant="caption" tone="muted">{description}</Text>}
        </View>
      )}
      <RNSwitch
        value={checked}
        onValueChange={onChange}
        disabled={disabled}
        accessibilityLabel={label}
        trackColor={{ false: colors.borderStrong, true: colors.primary }}
        thumbColor="#fff"
        ios_backgroundColor={colors.borderStrong}
      />
    </View>
  );
}

/* ------------------------------------------------------------------ Slider */
export function Slider({
  label,
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  formatValue = (v) => String(v),
  disabled,
}: {
  label?: string;
  min?: number;
  max?: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  formatValue?: (v: number) => string;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Field label={label} trailing={<Text variant="label" tone="primary">{formatValue(value)}</Text>}>
      <RNSlider
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={value}
        disabled={disabled}
        onValueChange={(v) => onChange(Number(v.toFixed(4)))}
        minimumTrackTintColor={colors.primary}
        maximumTrackTintColor={colors.border}
        thumbTintColor={colors.primary}
        accessibilityLabel={label}
      />
    </Field>
  );
}

/* ----------------------------------------------------------- NumberStepper */
export function NumberStepper({
  label,
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
  error,
}: {
  label?: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  error?: string;
}) {
  const { colors, radii } = useTheme();
  const counter = useCounter({ min, max, step, value, onChange });
  return (
    <Field label={label} error={error}>
      <View style={[styles.stepper, { borderColor: error ? colors.danger : colors.borderStrong, borderRadius: radii.md }]}>
        <Pressable accessibilityLabel="Decrease" onPress={counter.decrement} disabled={!counter.canDecrement} style={[styles.stepBtn, { backgroundColor: colors.surfaceAlt, opacity: counter.canDecrement ? 1 : 0.4 }]}>
          <Icon name="minus" size={16} />
        </Pressable>
        <TextInput
          keyboardType="number-pad"
          value={Number.isFinite(value) ? String(value) : ''}
          onChangeText={(t) => counter.set(Number(t.replace(/[^0-9]/g, '')) || min)}
          style={[styles.stepValue, { color: colors.text }]}
        />
        <Pressable accessibilityLabel="Increase" onPress={counter.increment} disabled={!counter.canIncrement} style={[styles.stepBtn, { backgroundColor: colors.surfaceAlt, opacity: counter.canIncrement ? 1 : 0.4 }]}>
          <Icon name="plus" size={16} />
        </Pressable>
      </View>
    </Field>
  );
}

/* -------------------------------------------------------- SegmentedControl */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: string; icon?: IconKey }>;
  value: T;
  onChange: (v: T) => void;
}) {
  const { colors, radii } = useTheme();
  return (
    <View accessibilityRole="radiogroup" style={[styles.segmented, { backgroundColor: colors.surfaceAlt, borderRadius: radii.md, borderColor: colors.border }]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={o.value}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            style={[styles.segment, { borderRadius: radii.sm }, active && { backgroundColor: colors.surface, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 2, shadowOffset: { width: 0, height: 1 }, elevation: 1 }]}
          >
            {o.icon && <Icon name={o.icon} size={15} color={active ? colors.text : colors.textMuted} />}
            <Text variant="label" style={{ color: active ? colors.text : colors.textMuted }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  input: { flexDirection: 'row', gap: 8, borderWidth: 1, paddingHorizontal: 12 },
  inputText: { flex: 1, fontSize: 15, minHeight: 44 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 4 },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  radio: { width: 22, height: 22, borderRadius: 11 },
  switchRow: { flexDirection: 'row', alignItems: 'center', gap: 12, justifyContent: 'space-between' },
  stepper: { flexDirection: 'row', alignItems: 'stretch', borderWidth: 1, height: 44, overflow: 'hidden', alignSelf: 'flex-start' },
  stepBtn: { width: 44, alignItems: 'center', justifyContent: 'center' },
  stepValue: { width: 60, textAlign: 'center', fontSize: 15, fontWeight: '600' },
  segmented: { flexDirection: 'row', padding: 3, gap: 2, borderWidth: 1 },
  segment: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 8 },
});
