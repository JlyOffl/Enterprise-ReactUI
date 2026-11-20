import { useTranslation } from 'react-i18next';
import { ACCENT_NAMES, accentSwatches, useModal, useSettings, type NavLayoutPreference, type ThemeMode } from '@erui/core';
import { Badge, Button, Card, DescriptionList, RadioGroup, SegmentedControl, cx } from '../components/ui';
import { PageHeader } from '../layout/PageHeader';
import { useViewportWidth } from '../platform/useViewport';

export default function SettingsPage() {
  const { t } = useTranslation();
  const width = useViewportWidth();
  const s = useSettings(width);
  const modal = useModal();

  return (
    <div className="stack gap-lg">
      <PageHeader
        title={t('settings.title')}
        subtitle={t('settings.subtitle')}
        actions={
          <Button
            variant="ghost"
            leftIcon="refresh"
            onClick={async () => (await modal.confirm({ title: t('settings.resetPreferences'), message: 'modals.confirmMessage' })) && s.resetPreferences()}
          >
            {t('settings.resetPreferences')}
          </Button>
        }
      />
      <div className="grid grid--2">
        <Card title={t('settings.appearance')}>
          <div className="stack gap-lg">
            <div className="field">
              <span className="field__label">{t('settings.theme')}</span>
              <SegmentedControl<ThemeMode>
                value={s.theme.mode}
                onChange={s.theme.setMode}
                options={[
                  { value: 'light', label: t('settings.light'), icon: 'sun' },
                  { value: 'dark', label: t('settings.dark'), icon: 'moon' },
                  { value: 'system', label: t('settings.system'), icon: 'monitor' },
                ]}
              />
            </div>
            <div className="field">
              <span className="field__label">{t('settings.accent')}</span>
              <div className="row gap-sm">
                {ACCENT_NAMES.map((a) => (
                  <button
                    key={a}
                    type="button"
                    className={cx('swatch', s.theme.accent === a && 'is-active')}
                    style={{ background: accentSwatches[a] }}
                    onClick={() => s.theme.setAccent(a)}
                    aria-label={a}
                    title={a}
                  />
                ))}
              </div>
            </div>
            <div className="field">
              <span className="field__label">
                {t('settings.density')} {!s.densityToggleEnabled && <Badge tone="neutral">flag: ui.compactDensityToggle</Badge>}
              </span>
              <SegmentedControl
                value={s.density}
                onChange={s.setDensity}
                options={[
                  { value: 'comfortable', label: t('settings.comfortable') },
                  { value: 'compact', label: t('settings.compact') },
                ]}
              />
            </div>
          </div>
        </Card>

        <Card title={t('settings.language')}>
          <RadioGroup
            variant="card"
            value={s.locale.locale}
            onChange={s.locale.setLocale}
            options={s.locale.locales.map((l) => ({ value: l.code, label: l.nativeLabel, description: l.label }))}
          />
        </Card>

        <Card title={t('settings.navigation')} subtitle="Tabs vs hamburger menu">
          <div className="stack gap-md">
            <SegmentedControl<NavLayoutPreference>
              value={s.nav.preference}
              onChange={s.nav.setPreference}
              options={[
                { value: 'auto', label: t('settings.navAuto') },
                { value: 'tabs', label: t('settings.navTabs'), icon: 'menu' },
                { value: 'hamburger', label: t('settings.navHamburger'), icon: 'panel' },
              ]}
            />
            <div className="text-sm text-muted">
              Resolved layout: <Badge tone="primary">{s.nav.layout}</Badge> · viewport {width}px · {s.nav.items.length} destinations.
              Auto uses tabs on wide screens with few destinations and a hamburger/side menu otherwise. On mobile auto = bottom tabs.
            </div>
          </div>
        </Card>

        <Card title={t('settings.about')}>
          <DescriptionList
            items={[
              { label: 'App', value: s.about.appName },
              { label: t('settings.version'), value: s.about.version },
              { label: t('settings.environment'), value: s.about.environment },
              { label: t('settings.platform'), value: s.about.platform },
              { label: 'Mock API', value: String(s.about.mockApi) },
              { label: 'External system id', value: <code>{s.about.externalSystemId}</code> },
            ]}
          />
        </Card>
      </div>
    </div>
  );
}
