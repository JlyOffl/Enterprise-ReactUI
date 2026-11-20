import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  COUNTRIES,
  PLANS,
  SKILLS,
  useRegistrationForm,
  useStepper,
  useValidationMessage,
  type RegistrationFormValues,
} from '@erui/core';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  Chip,
  CodeBlock,
  DatePicker,
  Field,
  NumberStepper,
  RadioGroup,
  Select,
  Stepper,
  Switch,
  TextArea,
  TextField,
} from '../components/ui';
import { PageHeader } from '../layout/PageHeader';

const STEPS: Array<{ id: string; fields: Array<keyof RegistrationFormValues> }> = [
  { id: 'account', fields: ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword'] },
  { id: 'profile', fields: ['birthDate', 'country', 'experience', 'skills', 'bio'] },
  { id: 'plan', fields: ['plan', 'newsletter', 'acceptTerms'] },
];

/** Client-side validation - Web: multi-step registration driven by a shared zod schema. */
export default function FormsPage() {
  const { t } = useTranslation();
  const tv = useValidationMessage();
  const { form, onSubmit, submitted, reset } = useRegistrationForm();
  const stepper = useStepper({ steps: STEPS });
  const { errors, isSubmitting } = form.formState;
  const err = (name: keyof RegistrationFormValues) => tv(errors[name]?.message as string | undefined);

  const next = async () => {
    const ok = await form.trigger(STEPS[stepper.activeIndex]!.fields);
    if (ok) stepper.next();
  };

  return (
    <div className="stack gap-lg">
      <PageHeader title={t('forms.title')} subtitle={t('forms.subtitle')} />
      <div className="grid grid--3-1">
        <Card title={t('forms.registration')}>
          <form onSubmit={onSubmit} noValidate className="stack gap-lg">
            <Stepper
              steps={[
                { id: 'account', label: 'Account', description: 'Credentials' },
                { id: 'profile', label: 'Profile', description: 'About you' },
                { id: 'plan', label: t('forms.plan'), description: 'Subscription' },
              ]}
              statusOf={stepper.statusOf}
            />

            {stepper.activeIndex === 0 && (
              <div className="form-grid">
                <TextField label={t('forms.firstName')} required error={err('firstName')} {...form.register('firstName')} />
                <TextField label={t('forms.lastName')} required error={err('lastName')} {...form.register('lastName')} />
                <TextField label={t('forms.email')} type="email" leftIcon="globe" required error={err('email')} {...form.register('email')} />
                <TextField label={t('forms.phone')} type="tel" helperText={t('common.optional')} error={err('phone')} {...form.register('phone')} />
                <TextField label={t('forms.password')} type="password" required helperText={t('validation.passwordStrength')} error={err('password')} {...form.register('password')} />
                <TextField label={t('forms.confirmPassword')} type="password" required error={err('confirmPassword')} {...form.register('confirmPassword')} />
              </div>
            )}

            {stepper.activeIndex === 1 && (
              <div className="form-grid">
                <Controller
                  control={form.control}
                  name="birthDate"
                  render={({ field }) => (
                    <DatePicker label={t('forms.birthDate')} required value={field.value} onChange={field.onChange} onBlur={field.onBlur} error={err('birthDate')} />
                  )}
                />
                <Controller
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <Select label={t('forms.country')} required options={COUNTRIES} value={field.value} onChange={field.onChange} onBlur={field.onBlur} error={err('country')} />
                  )}
                />
                <Controller
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <NumberStepper label={t('forms.experience')} value={field.value} onChange={field.onChange} min={0} max={50} error={err('experience')} />
                  )}
                />
                <Controller
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <Field label={t('forms.skills')} required error={err('skills')}>
                      <div className="row wrap gap-xs">
                        {SKILLS.map((s) => (
                          <Chip
                            key={s}
                            label={s}
                            selected={field.value.includes(s)}
                            onClick={() => field.onChange(field.value.includes(s) ? field.value.filter((x) => x !== s) : [...field.value, s])}
                          />
                        ))}
                      </div>
                    </Field>
                  )}
                />
                <div className="span-2">
                  <TextArea label={t('forms.bio')} rows={3} maxLength={280} showCount value={form.watch('bio')} error={err('bio')} {...form.register('bio')} />
                </div>
              </div>
            )}

            {stepper.activeIndex === 2 && (
              <div className="stack gap-md">
                <Controller
                  control={form.control}
                  name="plan"
                  render={({ field }) => (
                    <RadioGroup
                      label={t('forms.plan')}
                      variant="card"
                      direction="row"
                      value={field.value}
                      onChange={field.onChange}
                      error={err('plan')}
                      options={PLANS.map((p) => ({
                        value: p,
                        label: t(`forms.plan${p[0]!.toUpperCase()}${p.slice(1)}`),
                        description: p === 'basic' ? '$0' : p === 'pro' ? '$29 / user' : 'Contact sales',
                      }))}
                    />
                  )}
                />
                <Controller
                  control={form.control}
                  name="newsletter"
                  render={({ field }) => <Switch label={t('forms.newsletter')} checked={field.value} onChange={field.onChange} />}
                />
                <Controller
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <Checkbox label={t('forms.acceptTerms')} checked={field.value} onChange={field.onChange} error={err('acceptTerms')} />
                  )}
                />
              </div>
            )}

            <div className="row justify-between">
              <Button variant="ghost" onClick={() => (reset(), stepper.reset())}>
                {t('common.reset')}
              </Button>
              <div className="row gap-sm">
                <Button variant="secondary" disabled={stepper.isFirst} onClick={stepper.back}>
                  {t('common.previous')}
                </Button>
                {stepper.isLast ? (
                  <Button type="submit" loading={isSubmitting} leftIcon="check">
                    {t('common.submit')}
                  </Button>
                ) : (
                  <Button onClick={next} rightIcon="chevronRight">
                    {t('common.next')}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Card>

        <div className="stack gap-md">
          <Card title="Validation state">
            <div className="stack gap-xs text-sm">
              <span>Dirty: {String(form.formState.isDirty)}</span>
              <span>Touched fields: {Object.keys(form.formState.touchedFields).length}</span>
              <span>Errors: {Object.keys(errors).length}</span>
            </div>
          </Card>
          {submitted && (
            <Alert tone="success" title={t('forms.submitted')}>
              <CodeBlock code={JSON.stringify({ ...submitted, password: '••••', confirmPassword: '••••' }, null, 2)} maxHeight={260} />
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}
