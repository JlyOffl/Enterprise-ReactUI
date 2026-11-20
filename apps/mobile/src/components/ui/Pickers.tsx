import { useState, type ReactNode } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import {
  formatBytes,
  formatDate,
  useCalendar,
  useCombobox,
  useFileUpload,
  useLocale,
  useMultiSelect,
  useRating,
  useSelect,
  useTheme,
  type SelectOption,
} from '@erui/core';
import { Field, TextField } from './FormControls';
import { Icon, type IconKey } from './Icon';
import { Button, IconButton } from './Button';
import { Chip, ProgressBar } from './Feedback';
import { Sheet } from './Sheet';
import { Text } from './Typography';

interface BaseProps {
  label?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  placeholder?: string;
  onBlur?: () => void;
}

/** Trigger that looks like an input (shared by Select / Combobox / DatePicker). */
function PickerTrigger({ value, placeholder, onPress, error, icon = 'chevronDown' }: { value?: string; placeholder: string; onPress: () => void; error?: string; icon?: IconKey }) {
  const { colors, radii } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.trigger, { borderColor: error ? colors.danger : colors.borderStrong, backgroundColor: colors.surface, borderRadius: radii.md }]}
    >
      <Text numberOfLines={1} tone={value ? 'default' : 'subtle'} style={{ flex: 1 }}>
        {value || placeholder}
      </Text>
      <Icon name={icon} size={18} color={colors.textSubtle} />
    </Pressable>
  );
}

function OptionRow({ option, selected, onPress, trailing }: { option: SelectOption; selected: boolean; onPress: () => void; trailing?: ReactNode }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: option.disabled }}
      disabled={option.disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.option, { backgroundColor: pressed ? colors.surfaceAlt : 'transparent', opacity: option.disabled ? 0.4 : 1 }]}
    >
      <View style={{ flex: 1 }}>
        <Text weight={selected ? '600' : '400'} tone={selected ? 'primary' : 'default'}>
          {option.label}
        </Text>
        {option.description && <Text variant="caption" tone="muted">{option.description}</Text>}
      </View>
      {trailing ?? (selected && <Icon name="check" size={18} color={colors.primary} />)}
    </Pressable>
  );
}

/* ------------------------------------------------------------------ Select */
export function Select({ label, options, value, onChange, placeholder = 'Select…', helperText, error, required, onBlur }: BaseProps & { options: SelectOption[]; value: string; onChange: (v: string) => void }) {
  const select = useSelect({ options, value, onChange });
  const close = () => {
    select.close();
    onBlur?.();
  };
  return (
    <Field label={label} helperText={helperText} error={error} required={required}>
      <PickerTrigger value={select.selectedOption?.label} placeholder={placeholder} onPress={select.open} error={error} />
      <Sheet visible={select.isOpen} onClose={close} title={label ?? placeholder}>
        <FlatList data={options} keyExtractor={(o) => o.value} renderItem={({ item }) => <OptionRow option={item} selected={item.value === value} onPress={() => (select.select(item.value), onBlur?.())} />} />
      </Sheet>
    </Field>
  );
}

/* ---------------------------------------------------------------- Combobox */
export function Combobox({ label, options, value, onChange, placeholder = 'Search…', helperText, error, required, onBlur }: BaseProps & { options: SelectOption[]; value: string; onChange: (v: string) => void }) {
  const combo = useCombobox({ options, value, onChange });
  const { t } = useLocale();
  const close = () => {
    combo.close();
    onBlur?.();
  };
  return (
    <Field label={label} helperText={helperText} error={error} required={required}>
      <PickerTrigger value={combo.selectedOption?.label} placeholder={placeholder} onPress={combo.open} error={error} icon="search" />
      <Sheet visible={combo.isOpen} onClose={close} title={label} heightRatio={0.85}>
        <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
          <TextField leftIcon="search" autoFocus placeholder={placeholder} value={combo.query} onChangeText={combo.setQuery} />
        </View>
        <FlatList
          keyboardShouldPersistTaps="handled"
          data={combo.filtered}
          keyExtractor={(o) => o.value}
          ListEmptyComponent={<Text tone="muted" style={{ padding: 20 }}>{t('common.noResults')}</Text>}
          renderItem={({ item }) => <OptionRow option={item} selected={item.value === combo.selected} onPress={() => (combo.select(item), onBlur?.())} />}
        />
      </Sheet>
    </Field>
  );
}

/* ------------------------------------------------------------- MultiSelect */
export function MultiSelect({ label, options = [], value, onChange, placeholder = 'Add…', allowCustom, helperText, error, required, onBlur }: BaseProps & { options?: SelectOption[]; value: string[]; onChange: (v: string[]) => void; allowCustom?: boolean }) {
  const multi = useMultiSelect({ value, onChange, allowCustom });
  const [open, setOpen] = useState(false);
  const { colors, radii } = useTheme();
  const labelOf = (v: string) => options.find((o) => o.value === v)?.label ?? v;
  return (
    <Field label={label} helperText={helperText} error={error} required={required}>
      <Pressable onPress={() => setOpen(true)} style={[styles.tags, { borderColor: error ? colors.danger : colors.borderStrong, borderRadius: radii.md, backgroundColor: colors.surface }]}>
        {multi.values.length === 0 && <Text tone="subtle">{placeholder}</Text>}
        {multi.values.map((v) => (
          <Chip key={v} label={labelOf(v)} onRemove={() => multi.remove(v)} />
        ))}
      </Pressable>
      <Sheet
        visible={open}
        onClose={() => (setOpen(false), onBlur?.())}
        title={label}
        heightRatio={0.8}
        footer={<Button onPress={() => (setOpen(false), onBlur?.())}>Done</Button>}
      >
        {allowCustom && (
          <View style={{ paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
            <View style={{ flex: 1 }}>
              <TextField placeholder="Custom value" value={multi.inputValue} onChangeText={multi.setInputValue} onSubmitEditing={() => multi.add(multi.inputValue)} />
            </View>
            <Button size="md" leftIcon="plus" onPress={() => multi.add(multi.inputValue)} />
          </View>
        )}
        <FlatList
          data={options}
          keyExtractor={(o) => o.value}
          renderItem={({ item }) => (
            <OptionRow
              option={item}
              selected={multi.has(item.value)}
              onPress={() => multi.toggle(item.value)}
              trailing={
                <View style={[styles.box, { borderColor: multi.has(item.value) ? colors.primary : colors.borderStrong, backgroundColor: multi.has(item.value) ? colors.primary : 'transparent' }]}>
                  {multi.has(item.value) && <Icon name="check" size={14} color="#fff" />}
                </View>
              }
            />
          )}
        />
      </Sheet>
    </Field>
  );
}

/* --------------------------------------------------------------- DatePicker */
export function DatePicker({ label, value, onChange, min, max, placeholder = 'Pick a date', helperText, error, required, onBlur }: BaseProps & { value: string; onChange: (iso: string) => void; min?: string; max?: string }) {
  const { locale } = useLocale();
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const cal = useCalendar({ value, onChange: (iso) => (onChange(iso), setOpen(false), onBlur?.()), min, max, locale });
  return (
    <Field label={label} helperText={helperText} error={error} required={required}>
      <PickerTrigger value={value ? formatDate(`${value}T00:00:00`, locale, { dateStyle: 'long' }) : undefined} placeholder={placeholder} onPress={() => setOpen(true)} error={error} icon="calendar" />
      <Sheet visible={open} onClose={() => (setOpen(false), onBlur?.())} title={label ?? placeholder} heightRatio={0.75}>
        <View style={{ paddingHorizontal: 16, gap: 8 }}>
          <View style={styles.calHeader}>
            <IconButton icon="chevronLeft" label="Previous month" onPress={cal.prevMonth} />
            <Text variant="heading" style={{ textTransform: 'capitalize' }}>{cal.monthLabel}</Text>
            <IconButton icon="chevronRight" label="Next month" onPress={cal.nextMonth} />
          </View>
          <View style={styles.calRow}>
            {cal.weekdayLabels.map((d, i) => (
              <Text key={i} variant="caption" tone="subtle" align="center" style={styles.calCell}>
                {d}
              </Text>
            ))}
          </View>
          {cal.weeks.map((week, wi) => (
            <View key={wi} style={styles.calRow}>
              {week.map((day) => (
                <Pressable
                  key={day.iso}
                  disabled={day.isDisabled}
                  onPress={() => cal.select(day.iso)}
                  style={[
                    styles.calCell,
                    styles.calDay,
                    day.isSelected && { backgroundColor: colors.primary },
                    day.isToday && !day.isSelected && { borderWidth: 1, borderColor: colors.primary },
                    day.isDisabled && { opacity: 0.3 },
                  ]}
                >
                  <Text tone={day.isSelected ? 'inverse' : day.inMonth ? 'default' : 'subtle'} weight={day.isToday ? '700' : '400'}>
                    {day.day}
                  </Text>
                </Pressable>
              ))}
            </View>
          ))}
          <View style={styles.calHeader}>
            <Button variant="ghost" size="sm" onPress={cal.goToToday}>Today</Button>
            {!!value && <Button variant="ghost" size="sm" onPress={() => (cal.clear(), setOpen(false))}>Clear</Button>}
          </View>
        </View>
      </Sheet>
    </Field>
  );
}

/* ------------------------------------------------------------------ Rating */
export function Rating({ value, onChange, max = 5, readOnly, size = 28, label }: { value: number; onChange?: (v: number) => void; max?: number; readOnly?: boolean; size?: number; label?: string }) {
  const rating = useRating({ value, onChange, max, readOnly });
  const { colors } = useTheme();
  const content = (
    <View style={{ flexDirection: 'row', gap: 4 }} accessibilityRole="adjustable" accessibilityValue={{ min: 0, max, now: value }}>
      {rating.items.map((item) => (
        <Pressable key={item.index} disabled={readOnly} hitSlop={4} onPress={() => rating.select(item.index)} accessibilityLabel={`${item.index} of ${max}`}>
          <Icon name="star" size={size} color={item.filled ? '#f59e0b' : colors.borderStrong} />
        </Pressable>
      ))}
    </View>
  );
  return label ? <Field label={label}>{content}</Field> : content;
}

/* -------------------------------------------------------------- FileUpload */
export function FileUpload({ label, accept = ['*/*'], maxSizeBytes = 5 * 1024 * 1024, maxFiles = 5 }: { label?: string; accept?: string[]; maxSizeBytes?: number; maxFiles?: number }) {
  const upload = useFileUpload({ accept: accept.filter((a) => a !== '*/*'), maxSizeBytes, maxFiles });
  const { colors, radii } = useTheme();
  const pick = async () => {
    const result = await DocumentPicker.getDocumentAsync({ multiple: maxFiles > 1, type: accept, copyToCacheDirectory: true });
    if (result.canceled) return;
    upload.addFiles(result.assets.map((a) => ({ name: a.name, size: a.size ?? 0, type: a.mimeType ?? 'application/octet-stream', source: a.uri })));
  };
  return (
    <Field label={label}>
      <Pressable onPress={pick} style={[styles.dropzone, { borderColor: colors.borderStrong, borderRadius: radii.lg, backgroundColor: colors.surface }]}>
        <View style={[styles.dropIcon, { backgroundColor: colors.primarySoft }]}>
          <Icon name="upload" size={22} color={colors.primary} />
        </View>
        <Text weight="600">Tap to choose files</Text>
        <Text variant="caption" tone="muted">
          up to {formatBytes(maxSizeBytes)} · max {maxFiles} files
        </Text>
      </Pressable>
      {upload.rejections.map((r) => (
        <Text key={r} variant="caption" tone="danger">
          {r}
        </Text>
      ))}
      {upload.files.map((f) => (
        <View key={f.id} style={[styles.fileRow, { borderColor: colors.border, borderRadius: radii.md }]}>
          <Icon name="file" size={20} color={colors.textMuted} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text numberOfLines={1} weight="500">{f.name}</Text>
            {f.status === 'uploading' ? <ProgressBar value={f.progress} height={4} /> : <Text variant="caption" tone={f.status === 'error' ? 'danger' : f.status === 'done' ? 'success' : 'muted'}>{f.status === 'error' ? f.error : f.status === 'done' ? 'Uploaded' : formatBytes(f.size)}</Text>}
          </View>
          <IconButton icon="trash" label="Remove" size="sm" onPress={() => upload.remove(f.id)} />
        </View>
      ))}
      {upload.files.some((f) => f.status === 'pending' || f.status === 'error') && (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Button size="sm" leftIcon="upload" loading={upload.isUploading} onPress={upload.uploadAll}>Upload</Button>
          <Button size="sm" variant="ghost" onPress={upload.clear}>Clear</Button>
        </View>
      )}
    </Field>
  );
}

const styles = StyleSheet.create({
  trigger: { flexDirection: 'row', alignItems: 'center', gap: 8, height: 46, paddingHorizontal: 12, borderWidth: 1 },
  option: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 14 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, minHeight: 46, padding: 8, borderWidth: 1, alignItems: 'center' },
  box: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  calHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  calRow: { flexDirection: 'row' },
  calCell: { flex: 1, textAlign: 'center' },
  calDay: { height: 42, alignItems: 'center', justifyContent: 'center', borderRadius: 21, margin: 1 },
  dropzone: { borderWidth: 1.5, borderStyle: 'dashed', padding: 20, alignItems: 'center', gap: 6 },
  dropIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  fileRow: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderWidth: 1 },
});
