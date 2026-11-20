import { ScrollView, View } from 'react-native';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useOrderForm, useTheme, useValidationMessage, type Order } from '@erui/core';
import {
  Alert,
  Button,
  Combobox,
  DatePicker,
  Field,
  IconButton,
  ModalFooter,
  NumberStepper,
  SegmentedControl,
  Slider,
  Text,
  TextArea,
  TextField,
} from '../../components/ui';

/** Same business logic as the web OrderForm (useOrderForm) rendered with native controls. */
export function OrderForm({ onDone }: { onDone?: (order?: Order) => void }) {
  const { t } = useTranslation();
  const tv = useValidationMessage();
  const { colors, radii } = useTheme();
  const o = useOrderForm({ onCreated: (order) => onDone?.(order) });
  const { errors } = o.form.formState;

  return (
    <>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }} keyboardShouldPersistTaps="handled">
        {o.hasDraft && <Alert tone="info" action={<Button size="xs" variant="ghost" onPress={o.discardDraft}>{t('common.clear')}</Button>}>{t('orders.draftSaved')}</Alert>}
        <Controller
          control={o.form.control}
          name="customer"
          render={({ field }) => <TextField label={t('orders.customer')} required value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={tv(errors.customer?.message)} />}
        />
        <Controller
          control={o.form.control}
          name="priority"
          render={({ field }) => (
            <Field label={t('orders.priority')}>
              <SegmentedControl value={field.value} onChange={field.onChange} options={(['low', 'normal', 'high'] as const).map((p) => ({ value: p, label: t(`orders.priorities.${p}`) }))} />
            </Field>
          )}
        />
        <Controller
          control={o.form.control}
          name="requestedDate"
          render={({ field, fieldState }) => <DatePicker label={t('orders.requestedDate')} required value={field.value} onChange={field.onChange} onBlur={field.onBlur} error={tv(fieldState.error?.message)} />}
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="heading">{t('orders.lines')}</Text>
          <Button size="sm" variant="secondary" leftIcon="plus" onPress={o.addLine}>{t('orders.addLine')}</Button>
        </View>
        {errors.lines?.message && <Text variant="caption" tone="danger">{tv(errors.lines.message)}</Text>}
        {o.lines.fields.map((line, index) => (
          <View key={line.id} style={{ gap: 8, padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: radii.md }}>
            <Controller
              control={o.form.control}
              name={`lines.${index}.productId`}
              render={({ field, fieldState }) => (
                <Combobox label={t('orders.product')} options={o.productOptions} value={field.value} onChange={field.onChange} onBlur={field.onBlur} error={tv(fieldState.error?.message)} />
              )}
            />
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
              <Controller
                control={o.form.control}
                name={`lines.${index}.quantity`}
                render={({ field, fieldState }) => <NumberStepper label={t('orders.quantity')} value={field.value} onChange={field.onChange} min={1} max={999} error={tv(fieldState.error?.message)} />}
              />
              <Text weight="700">{o.formatted.line(o.quote.lines[index]?.lineTotal ?? 0)}</Text>
              <IconButton icon="trash" label={t('orders.removeLine')} disabled={o.lines.fields.length === 1} onPress={() => o.removeLine(index)} />
            </View>
          </View>
        ))}

        <Controller
          control={o.form.control}
          name="discountPct"
          render={({ field }) => <Slider label={t('orders.discount')} min={0} max={50} step={1} value={field.value} onChange={field.onChange} formatValue={(v) => `${v}%`} />}
        />
        <Controller
          control={o.form.control}
          name="notes"
          render={({ field }) => <TextArea label={t('orders.notes')} maxLength={500} showCount value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={tv(errors.notes?.message)} />}
        />

        {o.quote.warnings.map((w) => (
          <Alert key={w} tone="warning">{w}</Alert>
        ))}
        {o.requiresApproval && <Alert tone="info" title="Manager approval required">High value or high priority orders are routed for approval.</Alert>}

        <View style={{ gap: 6, padding: 14, borderRadius: radii.md, backgroundColor: colors.surfaceAlt }}>
          {[
            [t('orders.subtotal'), o.formatted.subtotal],
            [t('orders.discount'), `−${o.formatted.discount}`],
            [`${t('orders.tax')} (${Math.round(o.quote.taxRate * 100)}%)`, o.formatted.tax],
          ].map(([k, v]) => (
            <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text tone="muted">{k}</Text>
              <Text>{v}</Text>
            </View>
          ))}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingTop: 6 }}>
            <Text variant="heading">{t('orders.total')}</Text>
            <Text variant="heading">{o.formatted.total}</Text>
          </View>
        </View>
      </ScrollView>
      <ModalFooter>
        <Button variant="ghost" leftIcon="save" onPress={o.saveDraft}>Draft</Button>
        <Button variant="secondary" onPress={() => onDone?.()}>{t('common.cancel')}</Button>
        <Button leftIcon="check" loading={o.isSubmitting} onPress={() => void o.onSubmit()}>{t('common.create')}</Button>
      </ModalFooter>
    </>
  );
}
