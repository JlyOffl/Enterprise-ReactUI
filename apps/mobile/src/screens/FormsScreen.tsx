import { View } from 'react-native';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { COUNTRIES, PLANS, SKILLS, useRegistrationForm, useStepper, useValidationMessage, type RegistrationFormValues } from '@erui/core';
import { Alert, Button, Card, Checkbox, Chip, CodeBlock, DatePicker, Field, NumberStepper, RadioGroup, Select, Stepper, Switch, TextArea, TextField } from '../components/ui';
import { Row, Screen } from '../components/Screen';

const STEPS: Array<{ id: string; label: string; fields: Array<keyof RegistrationFormValues> }> = [
  { id: 'account', label: 'Account', fields: ['firstName', 'lastName', 'email', 'phone', 'password', 'confirmPassword'] },
  { id: 'profile', label: 'Profile', fields: ['birthDate', 'country', 'experience', 'skills', 'bio'] },
  { id: 'plan', label: 'Plan', fields: ['plan', 'newsletter', 'acceptTerms'] },
];

/** Client-side validation - Mobile: the very same zod schema + hook as the web page. */
export default function FormsScreen() {
  const { t } = useTranslation();
  const tv = useValidationMessage();
  const { form, onSubmit, submitted, reset } = useRegistrationForm();
  const stepper = useStepper({ steps: STEPS });
  const { errors, isSubmitting } = form.formState;
  const err = (name: keyof RegistrationFormValues) => tv(errors[name]?.message as string | undefined);
  const c = form.control;

  const next = async () => {
    if (await form.trigger(STEPS[stepper.activeIndex]!.fields)) stepper.next();
  };

  return (
    <Screen title={t('forms.title')} subtitle={t('forms.subtitle')}>
      <Card>
        <View style={{ gap: 16 }}>
          <Stepper steps={STEPS} statusOf={stepper.statusOf} />
          {stepper.activeIndex === 0 && (
            <>
              <Controller control={c} name="firstName" render={({ field }) => <TextField label={t('forms.firstName')} required value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={err('firstName')} />} />
              <Controller control={c} name="lastName" render={({ field }) => <TextField label={t('forms.lastName')} required value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={err('lastName')} />} />
              <Controller control={c} name="email" render={({ field }) => <TextField label={t('forms.email')} required keyboardType="email-address" autoCapitalize="none" leftIcon="globe" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={err('email')} />} />
              <Controller control={c} name="phone" render={({ field }) => <TextField label={t('forms.phone')} keyboardType="phone-pad" helperText={t('common.optional')} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={err('phone')} />} />
              <Controller control={c} name="password" render={({ field }) => <TextField label={t('forms.password')} required secureTextEntry helperText={t('validation.passwordStrength')} value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={err('password')} />} />
              <Controller control={c} name="confirmPassword" render={({ field }) => <TextField label={t('forms.confirmPassword')} required secureTextEntry value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={err('confirmPassword')} />} />
            </>
          )}
          {stepper.activeIndex === 1 && (
            <>
              <Controller control={c} name="birthDate" render={({ field }) => <DatePicker label={t('forms.birthDate')} required value={field.value} onChange={field.onChange} onBlur={field.onBlur} error={err('birthDate')} />} />
              <Controller control={c} name="country" render={({ field }) => <Select label={t('forms.country')} required options={COUNTRIES} value={field.value} onChange={field.onChange} onBlur={field.onBlur} error={err('country')} />} />
              <Controller control={c} name="experience" render={({ field }) => <NumberStepper label={t('forms.experience')} value={field.value} onChange={field.onChange} min={0} max={50} error={err('experience')} />} />
              <Controller
                control={c}
                name="skills"
                render={({ field }) => (
                  <Field label={t('forms.skills')} required error={err('skills')}>
                    <Row wrap>
                      {SKILLS.map((s) => (
                        <Chip key={s} label={s} selected={field.value.includes(s)} onPress={() => field.onChange(field.value.includes(s) ? field.value.filter((x) => x !== s) : [...field.value, s])} />
                      ))}
                    </Row>
                  </Field>
                )}
              />
              <Controller control={c} name="bio" render={({ field }) => <TextArea label={t('forms.bio')} maxLength={280} showCount value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={err('bio')} />} />
            </>
          )}
          {stepper.activeIndex === 2 && (
            <>
              <Controller
                control={c}
                name="plan"
                render={({ field }) => (
                  <RadioGroup
                    label={t('forms.plan')}
                    variant="card"
                    value={field.value}
                    onChange={field.onChange}
                    error={err('plan')}
                    options={PLANS.map((p) => ({ value: p, label: t(`forms.plan${p[0]!.toUpperCase()}${p.slice(1)}`) }))}
                  />
                )}
              />
              <Controller control={c} name="newsletter" render={({ field }) => <Switch label={t('forms.newsletter')} checked={field.value} onChange={field.onChange} />} />
              <Controller control={c} name="acceptTerms" render={({ field }) => <Checkbox label={t('forms.acceptTerms')} checked={field.value} onChange={field.onChange} error={err('acceptTerms')} />} />
            </>
          )}
          <Row>
            <Button variant="ghost" onPress={() => (reset(), stepper.reset())}>{t('common.reset')}</Button>
            <View style={{ flex: 1 }} />
            <Button variant="secondary" disabled={stepper.isFirst} onPress={stepper.back}>{t('common.previous')}</Button>
            {stepper.isLast ? (
              <Button leftIcon="check" loading={isSubmitting} onPress={() => void onSubmit()}>{t('common.submit')}</Button>
            ) : (
              <Button rightIcon="chevronRight" onPress={next}>{t('common.next')}</Button>
            )}
          </Row>
        </View>
      </Card>
      {submitted && (
        <Alert tone="success" title={t('forms.submitted')}>
          <CodeBlock code={JSON.stringify({ ...submitted, password: '••••', confirmPassword: '••••' }, null, 2)} />
        </Alert>
      )}
    </Screen>
  );
}
