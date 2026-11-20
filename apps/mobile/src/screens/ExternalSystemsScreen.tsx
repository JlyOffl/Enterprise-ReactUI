import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { getErrorMessage, useExternalSystemsWorkbench, useTheme } from '@erui/core';
import { Alert, Avatar, Badge, Button, Card, CodeBlock, DescriptionList, Select, Spinner, Text, TextField } from '../components/ui';
import { Row, Screen } from '../components/Screen';

export default function ExternalSystemsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const w = useExternalSystemsWorkbench();
  const result = w.lookup.data;

  return (
    <Screen title={t('externalSystems.title')} subtitle={t('externalSystems.subtitle')}>
      <Card title={t('externalSystems.clientId')} subtitle="Sent on every API request">
        <View style={{ gap: 10 }}>
          <Badge tone="primary">{w.clientSystemId}</Badge>
          <CodeBlock code={JSON.stringify(w.headers, null, 2)} maxHeight={160} />
        </View>
      </Card>
      <Card title={t('externalSystems.linkedIds')}>
        <View style={{ gap: 12 }}>
          {w.linkedIds.map(({ system, externalId }) => (
            <Row key={system.id}>
              <View style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: system.color }} />
              <View style={{ flex: 1 }}>
                <Text weight="600">{system.name}</Text>
                <Text variant="caption" tone="muted">{system.description}</Text>
              </View>
              {externalId ? <Text variant="mono" style={{ color: colors.text }}>{externalId}</Text> : <Badge>{t('externalSystems.notLinked')}</Badge>}
            </Row>
          ))}
        </View>
      </Card>
      <Card title={t('externalSystems.validate')}>
        <View style={{ gap: 12 }}>
          <Select label={t('externalSystems.systemLabel')} value={w.systemId} onChange={w.setSystemId} options={w.systems.map((s) => ({ value: s.id, label: s.name, description: s.description }))} />
          <TextField
            label={t('externalSystems.idLabel')}
            autoCapitalize="none"
            placeholder={w.selectedSystem?.example}
            helperText={`e.g. ${w.selectedSystem?.example}`}
            value={w.value}
            onChangeText={w.setValue}
            error={w.validation && !w.validation.valid ? t(w.validation.messageKey ?? 'validation.pattern') : undefined}
          />
          {w.validation?.valid && <Badge tone="success" icon="check">{t('externalSystems.valid')}</Badge>}
          <Button leftIcon="search" disabled={!w.canLookup} onPress={w.runLookup}>{t('externalSystems.lookup')}</Button>
          {w.lookup.isFetching && <Spinner />}
          {w.lookup.error && !w.lookup.isFetching && <Alert tone="warning">{getErrorMessage(w.lookup.error)}</Alert>}
          {result && !w.lookup.isFetching && (
            <Row>
              <Avatar name={result.name} />
              <View style={{ flex: 1 }}>
                <DescriptionList items={[{ label: 'Name', value: result.name }, { label: 'Email', value: result.email }, { label: 'Department', value: result.department }]} />
              </View>
            </Row>
          )}
        </View>
      </Card>
    </Screen>
  );
}
