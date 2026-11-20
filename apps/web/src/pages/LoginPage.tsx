import { useState } from 'react';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocale, useLoginForm, useTheme, useValidationMessage } from '@erui/core';
import { Alert, Badge, Button, Checkbox, Icon, IconButton, SegmentedControl, TextField } from '../components/ui';

/** Authentication - Web login (logic in the shared useLoginForm hook). */
export default function LoginPage() {
  const { t } = useTranslation();
  const tv = useValidationMessage();
  const { form, onSubmit, isSubmitting, error, demoAccounts, fillDemoAccount } = useLoginForm();
  const [showPassword, setShowPassword] = useState(false);
  const { locale, setLocale, locales } = useLocale();
  const theme = useTheme();
  const { errors } = form.formState;

  return (
    <div className="login">
      <div className="login__aside">
        <div className="login__brand">
          <span className="brand__logo brand__logo--lg">
            <Icon name="layers" size={24} />
          </span>
          <h1>{t('app.name')}</h1>
          <p>{t('app.tagline')}</p>
        </div>
        <ul className="login__features">
          {['React + React Native shared core', 'Redux Toolkit · RTK Query · InversifyJS', 'Dynatrace logging & instrumentation', 'Feature flags · RBAC · i18n'].map((f) => (
            <li key={f}>
              <Icon name="check" size={16} /> {f}
            </li>
          ))}
        </ul>
      </div>

      <div className="login__main">
        <div className="login__toolbar">
          <SegmentedControl
            size="sm"
            value={locale}
            onChange={setLocale}
            options={locales.map((l) => ({ value: l.code, label: l.code.toUpperCase() }))}
          />
          <IconButton icon={theme.scheme === 'dark' ? 'sun' : 'moon'} label="Toggle theme" onClick={theme.toggleScheme} />
        </div>

        <form className="login__card card" onSubmit={onSubmit} noValidate>
          <h2>{t('auth.title')}</h2>
          <p className="text-muted">{t('auth.subtitle')}</p>
          {error && <Alert tone="danger">{error}</Alert>}
          <TextField
            label={t('auth.email')}
            type="email"
            autoComplete="username"
            leftIcon="user"
            required
            error={tv(errors.email?.message)}
            {...form.register('email')}
          />
          <TextField
            label={t('auth.password')}
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            leftIcon="shield"
            required
            error={tv(errors.password?.message)}
            rightElement={
              <button type="button" className="input__clear" onClick={() => setShowPassword((s) => !s)} aria-label="Toggle password">
                <Icon name={showPassword ? 'eyeOff' : 'eye'} size={16} />
              </button>
            }
            {...form.register('password')}
          />
          <Controller
            control={form.control}
            name="rememberMe"
            render={({ field }) => <Checkbox label={t('auth.rememberMe')} checked={!!field.value} onChange={field.onChange} />}
          />
          <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
            {isSubmitting ? t('auth.signingIn') : t('auth.signIn')}
          </Button>

          <div className="divider divider--label">
            <span>{t('auth.demoAccounts')}</span>
          </div>
          <div className="demo-accounts">
            {demoAccounts.map((a) => (
              <button type="button" key={a.email} className="demo-account" onClick={() => fillDemoAccount(a.email)}>
                <span className="stack gap-xxs">
                  <strong>{a.name}</strong>
                  <span className="text-muted text-sm">{a.email}</span>
                </span>
                <Badge tone={a.role === 'admin' ? 'primary' : a.role === 'manager' ? 'info' : a.role === 'agent' ? 'success' : 'neutral'}>
                  {a.role}
                </Badge>
              </button>
            ))}
          </div>
        </form>
      </div>
    </div>
  );
}
