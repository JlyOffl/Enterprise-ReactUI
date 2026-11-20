import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAppLifecycle, useTheme } from '@erui/core';
import { Alert, Text } from './ui';

/** Standard scrollable screen with header, offline banner and pull-to-refresh. */
export function Screen({
  title,
  subtitle,
  actions,
  children,
  onRefresh,
  refreshing = false,
}: {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
}) {
  const { colors } = useTheme();
  const { online } = useAppLifecycle();
  const { t } = useTranslation();
  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      refreshControl={onRefresh ? <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} /> : undefined}
    >
      {!online && <Alert tone="warning">{t('errors.offline')}</Alert>}
      {(title || actions) && (
        <View style={styles.header}>
          <View style={{ flex: 1, gap: 2 }}>
            {title && <Text variant="title">{title}</Text>}
            {subtitle && <Text tone="muted">{subtitle}</Text>}
          </View>
          {actions}
        </View>
      )}
      {children}
    </ScrollView>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Text variant="label" tone="muted" style={{ textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 8 }}>
      {children}
    </Text>
  );
}

export function Row({ children, gap = 8, wrap }: { children: ReactNode; gap?: number; wrap?: boolean }) {
  return <View style={{ flexDirection: 'row', alignItems: 'center', gap, flexWrap: wrap ? 'wrap' : 'nowrap' }}>{children}</View>;
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 16, paddingBottom: 48 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
});
