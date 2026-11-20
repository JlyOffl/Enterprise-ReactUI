import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useLocale, useLoginForm, useTheme, useValidationMessage } from '@erui/core';
import { Alert, Badge, Button, Card, Checkbox, Divider, Icon, IconButton, SegmentedControl, Text, TextField } from '../components/ui';

/** Authentication - Mobile login. Same shared useLoginForm as the web page. */
export default function LoginScreen() {
  const { t } = useTranslation();
  const tv = useValidationMessage();
  const theme = useTheme();
  const { locale, setLocale, locales } = useLocale();
  const { form, onSubmit, isSubmitting, error, demoAccounts, fillDemoAccount } = useLoginForm();
  const [showPassword, setShowPassword] = useState(false);
  const { errors } = form.formState;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, gap: 20 }} keyboardShouldPersistTaps="handled">
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ width: 160 }}>
              <SegmentedControl value={locale} onChange={setLocale} options={locales.map((l) => ({ value: l.code, label: l.code.toUpperCase() }))} />
            </View>
            <IconButton icon={theme.scheme === 'dark' ? 'sun' : 'moon'} label="Toggle theme" onPress={theme.toggleScheme} />
          </View>

          <View style={{ alignItems: 'center', gap: 8, marginTop: 12 }}>
            <View style={{ width: 60, height: 60, borderRadius: 18, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="layers" size={30} color="#fff" />
            </View>
            <Text variant="display">{t('app.name')}</Text>
            <Text tone="muted">{t('app.tagline')}</Text>
          </View>

          <Card>
            <View style={{ gap: 14 }}>
              <Text variant="title">{t('auth.title')}</Text>
              <Text tone="muted">{t('auth.subtitle')}</Text>
              {error && <Alert tone="danger">{error}</Alert>}
              <Controller
                control={form.control}
                name="email"
                render={({ field }) => (
                  <TextField label={t('auth.email')} leftIcon="user" keyboardType="email-address" autoCapitalize="none" autoComplete="email" value={field.value} onChangeText={field.onChange} onBlur={field.onBlur} error={tv(errors.email?.message)} />
                )}
              />
              <Controller
                control={form.control}
                name="password"
                render={({ field }) => (
                  <TextField
                    label={t('auth.password')}
                    leftIcon="shield"
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    onSubmitEditing={() => void onSubmit()}
                    error={tv(errors.password?.message)}
                    rightElement={<IconButton size="sm" icon={showPassword ? 'eyeOff' : 'eye'} label="Toggle password" onPress={() => setShowPassword((s) => !s)} />}
                  />
                )}
              />
              <Controller control={form.control} name="rememberMe" render={({ field }) => <Checkbox label={t('auth.rememberMe')} checked={field.value} onChange={field.onChange} />} />
              <Button size="lg" fullWidth loading={isSubmitting} onPress={() => void onSubmit()}>
                {isSubmitting ? t('auth.signingIn') : t('auth.signIn')}
              </Button>
              <Divider label={t('auth.demoAccounts')} />
              {demoAccounts.map((a) => (
                <Pressable
                  key={a.email}
                  onPress={() => fillDemoAccount(a.email)}
                  style={({ pressed }) => ({
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 12,
                    borderWidth: 1,
                    borderRadius: theme.radii.md,
                    borderColor: pressed ? theme.colors.primary : theme.colors.border,
                    backgroundColor: pressed ? theme.colors.primarySoft : theme.colors.surface,
                  })}
                >
                  <View>
                    <Text weight="600">{a.name}</Text>
                    <Text variant="caption" tone="muted">{a.email}</Text>
                  </View>
                  <Badge tone={a.role === 'admin' ? 'primary' : a.role === 'manager' ? 'info' : a.role === 'agent' ? 'success' : 'neutral'}>{a.role}</Badge>
                </Pressable>
              ))}
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
