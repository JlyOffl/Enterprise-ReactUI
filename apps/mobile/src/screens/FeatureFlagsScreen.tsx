import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useFeatureFlagAdmin, useLocale, useTheme } from '@erui/core';
import { Badge, Button, Card, IconButton, Switch, Text } from '../components/ui';
import { Row, Screen } from '../components/Screen';

const categoryTone = { module: 'primary', ui: 'info', experimental: 'warning', ops: 'neutral' } as const;

export default function FeatureFlagsScreen() {
  const { t } = useTranslation();
  const { format } = useLocale();
  const { colors } = useTheme();
  const admin = useFeatureFlagAdmin();
  return (
    <Screen title={t('featureFlags.title')} subtitle={t('featureFlags.subtitle')} onRefresh={admin.refresh} refreshing={admin.status === 'loading'}>
      <Row wrap>
        <Badge tone={admin.source === 'remote' ? 'success' : 'neutral'} dot>{`${t('featureFlags.source')}: ${admin.source}`}</Badge>
        {admin.lastLoadedAt && <Text variant="caption" tone="muted">{format.relative(admin.lastLoadedAt)}</Text>}
        <View style={{ flex: 1 }} />
        <Button size="sm" variant="ghost" disabled={!admin.overrideCount} onPress={admin.resetOverrides}>{`${t('featureFlags.resetOverrides')} (${admin.overrideCount})`}</Button>
      </Row>
      <Card padded={false}>
        {admin.flags.map((f, i) => (
          <View key={f.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }}>
            <View style={{ flex: 1, gap: 4 }}>
              <Text variant="mono" style={{ color: colors.text }}>{f.key}</Text>
              <Text variant="caption" tone="muted">{f.description}</Text>
              <Row wrap gap={6}>
                <Badge tone={categoryTone[f.category]}>{f.category}</Badge>
                {f.rolloutPercentage !== undefined && <Badge>{`${f.rolloutPercentage}%`}</Badge>}
                {f.overridden && <Badge tone="warning" variant="outline">{t('featureFlags.overridden')}</Badge>}
              </Row>
            </View>
            {f.overridden && <IconButton icon="refresh" size="sm" label={t('featureFlags.clearOverride')} onPress={() => admin.clearOverride(f.key)} />}
            <Switch checked={f.value} onChange={(v) => admin.setOverride(f.key, v)} />
          </View>
        ))}
      </Card>
    </Screen>
  );
}
