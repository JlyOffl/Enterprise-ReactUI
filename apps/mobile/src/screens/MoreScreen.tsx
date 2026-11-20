import { Pressable, View } from 'react-native';
import { useWindowDimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useAuth, useNavigationLayout, useTheme } from '@erui/core';
import { Avatar, Badge, Button, Card, Icon, Text } from '../components/ui';
import { Screen } from '../components/Screen';
import { useAppNavigate } from '../navigation/useAppNavigate';

/** Overflow destinations when the bottom tab bar is full ("More" tab pattern). */
export default function MoreScreen() {
  const { t } = useTranslation();
  const { colors, radii } = useTheme();
  const { width } = useWindowDimensions();
  const { overflow } = useNavigationLayout({ platform: 'native', viewportWidth: width, maxTabs: 4 });
  const { user, logout } = useAuth();
  const go = useAppNavigate();

  return (
    <Screen>
      {user && (
        <Card>
          <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <Avatar name={user.name} size={48} status="online" />
            <View style={{ flex: 1, gap: 2 }}>
              <Text variant="heading">{user.name}</Text>
              <Text variant="caption" tone="muted">{user.email}</Text>
              <Badge tone="primary">{user.roles.join(', ')}</Badge>
            </View>
          </View>
        </Card>
      )}
      <View style={{ borderRadius: radii.lg, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
        {overflow.map((item, i) => (
          <Pressable
            key={item.id}
            onPress={() => go(item.id)}
            style={({ pressed }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              padding: 16,
              backgroundColor: pressed ? colors.surfaceAlt : colors.surface,
              borderTopWidth: i ? 1 : 0,
              borderTopColor: colors.border,
            })}
          >
            <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={item.icon} size={18} color={colors.primary} />
            </View>
            <Text weight="500" style={{ flex: 1 }}>{t(item.labelKey)}</Text>
            <Icon name="chevronRight" size={18} color={colors.textSubtle} />
          </Pressable>
        ))}
      </View>
      <Button variant="danger" leftIcon="logout" onPress={logout}>{t('nav.logout')}</Button>
    </Screen>
  );
}
