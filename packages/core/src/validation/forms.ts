import { useCallback, useState } from 'react';
import { useLogin } from '../auth/hooks';
import { useToast } from '../notifications/hooks';
import { useAnalytics } from '../instrumentation/hooks';
import { DEMO_ACCOUNTS } from '../api/mock/data';
import { useZodForm } from './useZodForm';
import {
  loginSchema,
  registrationDefaults,
  registrationSchema,
  type LoginFormValues,
  type RegistrationFormValues,
} from './schemas';

/** Login screen logic (shared): validation, submit, demo account helpers. */
export function useLoginForm() {
  const { login, isLoading, error } = useLogin();
  const form = useZodForm(loginSchema, {
    defaultValues: { email: '', password: '', rememberMe: true },
  });

  const onSubmit = form.handleSubmit(async (values: LoginFormValues) => {
    try {
      await login(values);
    } catch {
      /* error surfaced via `error` */
    }
  });

  const fillDemoAccount = useCallback(
    (email: string) => {
      const account = DEMO_ACCOUNTS.find((a) => a.email === email);
      if (!account) return;
      form.setValue('email', account.email, { shouldValidate: true });
      form.setValue('password', account.password, { shouldValidate: true });
    },
    [form],
  );

  return {
    form,
    onSubmit,
    isSubmitting: isLoading,
    error,
    demoAccounts: DEMO_ACCOUNTS.map(({ email, role, name }) => ({ email, role, name })),
    fillDemoAccount,
  };
}

/** Registration form logic (shared): validation, step navigation, submit. */
export function useRegistrationForm() {
  const toast = useToast();
  const analytics = useAnalytics();
  const [submitted, setSubmitted] = useState<RegistrationFormValues | null>(null);
  const form = useZodForm(registrationSchema, { defaultValues: registrationDefaults });

  const onSubmit = form.handleSubmit(
    async (values) => {
      await new Promise((r) => setTimeout(r, 600));
      setSubmitted(values);
      analytics.track('forms.registration_submitted', { plan: values.plan, skills: values.skills.length });
      toast.success('forms.submitted', `${values.firstName} ${values.lastName}`);
    },
    (errors) => analytics.track('forms.registration_invalid', { fields: Object.keys(errors).join(',') }),
  );

  const reset = () => {
    form.reset(registrationDefaults);
    setSubmitted(null);
  };

  return { form, onSubmit, submitted, reset };
}
