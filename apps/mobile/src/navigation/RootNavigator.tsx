import { useMemo, useRef, type ComponentType } from 'react';
import { useWindowDimensions, View } from 'react-native';
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  useNavigationContainerRef,
  type Theme as NavTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { useTranslation } from 'react-i18next';
import {
  healthStatusTone,
  selectOverallHealth,
  useAllNavItems,
  useAnalytics,
  useAppLifecycle,
  useAppSelector,
  useAuth,
  useFeatureFlag,
  useNavigationLayout,
  usePermission,
  useTheme,
  type NavItem,
} from '@erui/core';
import { ActionMenu, Alert, Avatar, EmptyState, Icon, IconButton, Spinner, Text, toneColors } from '../components/ui';
import { useAppNavigate } from './useAppNavigate';
import LoginScreen from '../screens/LoginScreen';
import MoreScreen from '../screens/MoreScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ControlsScreen from '../screens/ControlsScreen';
import FormsScreen from '../screens/FormsScreen';
import DynamicFormsScreen from '../screens/DynamicFormsScreen';
import UsersScreen from '../screens/UsersScreen';
import OrdersScreen from '../screens/OrdersScreen';
import ModalsScreen from '../screens/ModalsScreen';
import FeatureFlagsScreen from '../screens/FeatureFlagsScreen';
import ObservabilityScreen from '../screens/ObservabilityScreen';
import ExternalSystemsScreen from '../screens/ExternalSystemsScreen';
import SettingsScreen from '../screens/SettingsScreen';

/** Composable architecture - Mobile: route id (from shared modules) -> screen component. */
const SCREENS: Record<string, ComponentType> = {
  dashboard: DashboardScreen,
  controls: ControlsScreen,
  forms: FormsScreen,
  dynamicForms: DynamicFormsScreen,
  users: UsersScreen,
  orders: OrdersScreen,
  modals: ModalsScreen,
  featureFlags: FeatureFlagsScreen,
  observability: ObservabilityScreen,
  externalSystems: ExternalSystemsScreen,
  settings: SettingsScreen,
};

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

/** Authorization + feature flag guard (same rules as web RouteGuard). */
function RouteGuard({ item }: { item: NavItem }) {
  const { t } = useTranslation();
  const allowed = usePermission(item.permission);
  const flagOn = useFeatureFlag(item.featureFlag ?? '');
  if (item.featureFlag && !flagOn) return <EmptyState icon="flag" title={t('errors.notFound')} description={t('errors.notFoundBody')} />;
  if (!allowed) return <EmptyState icon="shield" title={t('auth.accessDenied')} description={t('auth.accessDeniedBody')} />;
  const Screen = SCREENS[item.id];
  return Screen ? <Screen /> : <EmptyState title={t('errors.notFound')} />;
}

const guardCache = new Map<string, ComponentType>();
function screenFor(item: NavItem): ComponentType {
  let cmp = guardCache.get(item.id);
  if (!cmp) {
    cmp = function GuardedScreen() {
      return <RouteGuard item={item} />;
    };
    guardCache.set(item.id, cmp);
  }
  return cmp;
}

function HeaderActions() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { user, logout } = useAuth();
  const health = useAppSelector(selectOverallHealth);
  const go = useAppNavigate();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, paddingRight: 8 }}>
      <IconButton icon="activity" label={`${t('dashboard.systemHealth')}: ${t(`health.${health}`)}`} onPress={() => go('observability')} />
      <View style={{ position: 'absolute', left: 26, top: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: toneColors(theme, healthStatusTone[health]).fg }} />
      <IconButton icon={theme.scheme === 'dark' ? 'sun' : 'moon'} label={t('settings.theme')} onPress={theme.toggleScheme} />
      {user && (
        <ActionMenu
          title={user.name}
          trigger={(open) => (
            <IconButton icon="user" label={user.name} onPress={open} />
          )}
          items={[
            { id: 'settings', label: t('nav.settings'), icon: 'settings', onSelect: () => go('settings') },
            { id: 'logout', label: t('nav.logout'), icon: 'logout', danger: true, onSelect: logout },
          ]}
        />
      )}
    </View>
  );
}

function MainTabs() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const { tabs, overflow } = useNavigationLayout({ platform: 'native', viewportWidth: width, maxTabs: 4 });
  return (
    <Tab.Navigator screenOptions={{ headerRight: () => <HeaderActions />, tabBarLabelStyle: { fontSize: 11, fontWeight: '600' } }}>
      {tabs.map((item) => (
        <Tab.Screen
          key={item.id}
          name={item.id}
          component={screenFor(item)}
          options={{ title: t(item.labelKey), tabBarIcon: ({ color, size }) => <Icon name={item.icon} color={color} size={size} /> }}
        />
      ))}
      {overflow.length > 0 && (
        <Tab.Screen name="more" component={MoreScreen} options={{ title: t('nav.more'), tabBarIcon: ({ color, size }) => <Icon name="more" color={color} size={size} /> }} />
      )}
    </Tab.Navigator>
  );
}

function DrawerContentHeader() {
  const { t } = useTranslation();
  const { user } = useAuth();
  return (
    <View style={{ padding: 16, gap: 8, flexDirection: 'row', alignItems: 'center' }}>
      {user && <Avatar name={user.name} size={40} status="online" />}
      <View>
        <Text variant="heading">{t('app.name')}</Text>
        {user && <Text variant="caption" tone="muted">{user.email}</Text>}
      </View>
    </View>
  );
}

function MainDrawer() {
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const { items } = useNavigationLayout({ platform: 'native', viewportWidth: width });
  return (
    <Drawer.Navigator
      screenOptions={{ headerRight: () => <HeaderActions />, drawerType: width >= 900 ? 'permanent' : 'front' }}
      drawerContent={(props) => (
        <DrawerContentScrollView {...props}>
          <DrawerContentHeader />
          <DrawerItemList {...props} />
        </DrawerContentScrollView>
      )}
    >
      {items.map((item) => (
        <Drawer.Screen
          key={item.id}
          name={item.id}
          component={screenFor(item)}
          options={{ title: t(item.labelKey), drawerIcon: ({ color, size }) => <Icon name={item.icon} color={color} size={size} /> }}
        />
      ))}
    </Drawer.Navigator>
  );
}

function BootScreen() {
  const { colors } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, backgroundColor: colors.background }}>
      <Icon name="layers" size={40} color={colors.primary} />
      <Spinner size="large" />
    </View>
  );
}

/** Navigation - Mobile: stack + (bottom tabs | drawer) chosen by the shared Tabs-vs-Hamburger rule. */
export function RootNavigator() {
  const { t } = useTranslation();
  const theme = useTheme();
  const auth = useAuth();
  const lifecycle = useAppLifecycle();
  const analytics = useAnalytics();
  const allItems = useAllNavItems();
  const { width } = useWindowDimensions();
  const { layout } = useNavigationLayout({ platform: 'native', viewportWidth: width });
  const navRef = useNavigationContainerRef();
  const lastRoute = useRef<string | undefined>(undefined);

  const navTheme = useMemo<NavTheme>(() => {
    const base = theme.scheme === 'dark' ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.text,
        border: theme.colors.border,
        notification: theme.colors.danger,
      },
    };
  }, [theme]);

  if (lifecycle.phase === 'error') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: theme.colors.background }}>
        <Alert tone="danger" title="Application failed to start">{lifecycle.bootError ?? ''}</Alert>
      </View>
    );
  }
  if (auth.isRestoring) return <BootScreen />;

  return (
    <NavigationContainer
      ref={navRef}
      theme={navTheme}
      onStateChange={() => {
        // Instrumentation: screen views for every navigation change
        const name = navRef.getCurrentRoute()?.name;
        if (name && name !== lastRoute.current) {
          lastRoute.current = name;
          analytics.screen(name.replace(/^screen\./, ''));
        }
      }}
    >
      <Stack.Navigator>
        {!auth.isAuthenticated ? (
          <Stack.Screen name="login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="main" component={layout === 'tabs' ? MainTabs : MainDrawer} options={{ headerShown: false }} />
            {allItems.map((item) => (
              <Stack.Screen key={item.id} name={`screen.${item.id}`} component={screenFor(item)} options={{ title: t(item.labelKey), headerBackTitle: t('common.back') }} />
            ))}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

