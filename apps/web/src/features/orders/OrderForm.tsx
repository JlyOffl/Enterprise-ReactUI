import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useOrderForm, useValidationMessage, type Order } from '@erui/core';
import {
  Alert,
  Button,
  Combobox,
  DatePicker,
  IconButton,
  NumberStepper,
  SegmentedControl,
  Slider,
  TextArea,
  TextField,
} from '../../components/ui';

/** Order capture form. All rules (validation, pricing, approval, drafts) come from useOrderForm. */
export function OrderForm({ onDone }: { onDone?: (order?: Order) => void }) {
  const { t } = useTranslation();
  const tv = useValidationMessage();
  const o = useOrderForm({ onCreated: (order) => onDone?.(order) });
  const { errors } = o.form.formState;

  return (
    <form onSubmit={o.onSubmit} noValidate className="order-form">
      <div className="modal__body stack gap-md">
        {o.hasDraft && (
          <Alert tone="info" action={<Button size="xs" variant="ghost" onClick={o.discardDraft}>{t('common.clear')}</Button>}>
            {t('orders.draftSaved')}
          </Alert>
        )}
        <div className="form-grid">
          <div className="span-2">
            <TextField label={t('orders.customer')} required error={tv(errors.customer?.message)} {...o.form.register('customer')} />
          </div>
          <Controller
            control={o.form.control}
            name="priority"
            render={({ field }) => (
              <div className="field">
                <span className="field__label">{t('orders.priority')}</span>
                <SegmentedControl
                  fullWidth
                  value={field.value}
                  onChange={field.onChange}
                  options={(['low', 'normal', 'high'] as const).map((p) => ({ value: p, label: t(`orders.priorities.${p}`) }))}
                />
              </div>
            )}
          />
          <Controller
            control={o.form.control}
            name="requestedDate"
            render={({ field, fieldState }) => (
              <DatePicker label={t('orders.requestedDate')} required value={field.value} onChange={field.onChange} onBlur={field.onBlur} error={tv(fieldState.error?.message)} />
            )}
          />
        </div>

        <div className="stack gap-sm">
          <div className="row justify-between">
            <strong>{t('orders.lines')}</strong>
            <Button size="sm" variant="secondary" leftIcon="plus" onClick={o.addLine}>
              {t('orders.addLine')}
            </Button>
          </div>
          {errors.lines?.message && <div className="field__error">{tv(errors.lines.message)}</div>}
          {o.lines.fields.map((line, index) => (
            <div key={line.id} className="order-line">
              <Controller
                control={o.form.control}
                name={`lines.${index}.productId`}
                render={({ field, fieldState }) => (
                  <Combobox
                    label={index === 0 ? t('orders.product') : undefined}
                    options={o.productOptions}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={tv(fieldState.error?.message)}
                  />
                )}
              />
              <Controller
                control={o.form.control}
                name={`lines.${index}.quantity`}
                render={({ field, fieldState }) => (
                  <NumberStepper
                    label={index === 0 ? t('orders.quantity') : undefined}
                    value={field.value}
                    onChange={field.onChange}
                    min={1}
                    max={999}
                    error={tv(fieldState.error?.message)}
                  />
                )}
              />
              <div className="order-line__total">{o.formatted.line(o.quote.lines[index]?.lineTotal ?? 0)}</div>
              <IconButton icon="trash" label={t('orders.removeLine')} size="sm" disabled={o.lines.fields.length === 1} onClick={() => o.removeLine(index)} />
            </div>
          ))}
        </div>

        <Controller
          control={o.form.control}
          name="discountPct"
          render={({ field }) => (
            <Slider label={t('orders.discount')} min={0} max={50} step={1} value={field.value} onChange={field.onChange} formatValue={(v) => `${v}%`} marks={[10, 20, 30, 40]} />
          )}
        />
        <TextArea label={t('orders.notes')} rows={3} maxLength={500} showCount value={o.form.watch('notes')} error={tv(errors.notes?.message)} {...o.form.register('notes')} />

        {o.quote.warnings.map((w) => (
          <Alert key={w} tone="warning">
            {w}
          </Alert>
        ))}
        {o.requiresApproval && <Alert tone="info" title="Manager approval required">High value or high priority orders are routed for approval.</Alert>}

        <div className="quote card">
          <div className="quote__row">
            <span>{t('orders.subtotal')}</span>
            <span>{o.formatted.subtotal}</span>
          </div>
          <div className="quote__row text-muted">
            <span>
              {t('orders.discount')}
              {o.quote.volumeDiscount > 0 && ' (incl. volume 2%)'}
            </span>
            <span>−{o.formatted.discount}</span>
          </div>
          <div className="quote__row text-muted">
            <span>
              {t('orders.tax')} ({Math.round(o.quote.taxRate * 100)}%)
            </span>
            <span>{o.formatted.tax}</span>
          </div>
          <div className="quote__row quote__total">
            <span>{t('orders.total')}</span>
            <span>{o.formatted.total}</span>
          </div>
        </div>
      </div>
      <div className="modal__footer">
        <Button variant="ghost" leftIcon="save" onClick={o.saveDraft}>
          {t('common.save')} draft
        </Button>
        <Button variant="secondary" onClick={() => onDone?.()}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" loading={o.isSubmitting} leftIcon="check">
          {t('common.create')}
        </Button>
      </div>
    </form>
  );
}
