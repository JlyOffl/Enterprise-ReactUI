import { Pressable, View, useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ACCENT_NAMES, accentSwatches, useModal, useSettings, useTheme, type NavLayoutPreference, type ThemeMode } from '@erui/core';
import { Badge, Button, Card, DescriptionList, Field, RadioGroup, SegmentedControl, Text } from '../components/ui';
import { Row, Screen } from '../components/Screen';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const s = useSettings(width);
  const { colors } = useTheme();
  const modal = useModal();

  return (
    <Screen title={t('settings.title')} subtitle={t('settings.subtitle')}>
      <Card title={t('settings.appearance')}>
        <View style={{ gap: 16 }}>
          <Field label={t('settings.theme')}>
            <SegmentedControl<ThemeMode>
              value={s.theme.mode}
              onChange={s.theme.setMode}
              options={[
                { value: 'light', label: t('settings.light'), icon: 'sun' },
                { value: 'dark', label: t('settings.dark'), icon: 'moon' },
                { value: 'system', label: t('settings.system'), icon: 'monitor' },
              ]}
            />
          </Field>
          <Field label={t('settings.accent')}>
            <Row gap={12}>
              {ACCENT_NAMES.map((a) => (
                <Pressable
                  key={a}
                  accessibilityLabel={a}
                  onPress={() => s.theme.setAccent(a)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: accentSwatches[a],
                    borderWidth: 3,
                    borderColor: s.theme.accent === a ? colors.text : colors.surface,
                  }}
                />
              ))}
            </Row>
          </Field>
        </View>
      </Card>

      <Card title={t('settings.language')}>
        <RadioGroup variant="card" value={s.locale.locale} onChange={s.locale.setLocale} options={s.locale.locales.map((l) => ({ value: l.code, label: l.nativeLabel, description: l.label }))} />
      </Card>

      <Card title={t('settings.navigation')} subtitle="Tabs vs hamburger menu">
        <View style={{ gap: 10 }}>
          <SegmentedControl<NavLayoutPreference>
            value={s.nav.preference}
            onChange={s.nav.setPreference}
            options={[
              { value: 'auto', label: t('settings.navAuto') },
              { value: 'tabs', label: t('settings.navTabs') },
              { value: 'hamburger', label: t('settings.navHamburger') },
            ]}
          />
          <Row>
            <Text tone="muted">Resolved:</Text>
            <Badge tone="primary">{s.nav.layout === 'tabs' ? 'bottom tabs' : 'drawer'}</Badge>
          </Row>
        </View>
      </Card>

      <Card title={t('settings.about')}>
        <DescriptionList
          items={[
            { label: t('settings.version'), value: s.about.version },
            { label: t('settings.environment'), value: s.about.environment },
            { label: t('settings.platform'), value: `${s.about.platform} ${s.about.device.osVersion ?? ''}` },
            { label: 'Mock API', value: String(s.about.mockApi) },
            { label: 'External system id', value: s.about.externalSystemId },
          ]}
        />
      </Card>

      <Button
        variant="secondary"
        leftIcon="refresh"
        onPress={async () => (await modal.confirm({ title: t('settings.resetPreferences'), message: 'modals.confirmMessage' })) && s.resetPreferences()}
      >
        {t('settings.resetPreferences')}
      </Button>
    </Screen>
  );
}
