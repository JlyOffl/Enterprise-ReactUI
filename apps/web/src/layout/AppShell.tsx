import { useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ErrorBoundary,
  healthStatusTone,
  selectOverallHealth,
  useAppLifecycle,
  useAppSelector,
  useAuth,
  useLocale,
  useNavigationLayout,
  useNavigationSections,
  useShellState,
  useTheme,
  type NavItem,
} from '@erui/core';
import { Alert, Avatar, Badge, Button, DropdownMenu, Icon, IconButton, Tooltip, cx } from '../components/ui';
import { useViewportWidth } from '../platform/useViewport';

function Brand({ collapsed }: { collapsed?: boolean }) {
  const { t } = useTranslation();
  return (
    <div className="brand">
      <span className="brand__logo">
        <Icon name="layers" size={18} />
      </span>
      {!collapsed && <span className="brand__name">{t('app.name')}</span>}
    </div>
  );
}

function SideNav({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const sections = useNavigationSections();
  const { t } = useTranslation();
  return (
    <nav className="sidenav" aria-label="Primary">
      {sections.map((s) => (
        <div key={s.section} className="sidenav__section">
          {!collapsed && <div className="sidenav__heading">{t(s.labelKey)}</div>}
          {s.items.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/'}
              onClick={onNavigate}
              className={({ isActive }) => cx('sidenav__link', isActive && 'is-active')}
              title={collapsed ? t(item.labelKey) : undefined}
            >
              <Icon name={item.icon} size={18} />
              {!collapsed && <span>{t(item.labelKey)}</span>}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}

function TopTabs({ tabs, overflow }: { tabs: NavItem[]; overflow: NavItem[] }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const overflowActive = overflow.some((i) => i.path !== '/' && location.pathname.startsWith(i.path));
  return (
    <nav className="toptabs" aria-label="Primary">
      {tabs.map((item) => (
        <NavLink key={item.id} to={item.path} end={item.path === '/'} className={({ isActive }) => cx('toptabs__tab', isActive && 'is-active')}>
          <Icon name={item.icon} size={16} />
          {t(item.labelKey)}
        </NavLink>
      ))}
      {overflow.length > 0 && (
        <DropdownMenu
          align="start"
          trigger={({ toggle, open }) => (
            <button type="button" className={cx('toptabs__tab', overflowActive && 'is-active')} onClick={toggle} aria-expanded={open}>
              <Icon name="more" size={16} />
              {t('nav.more')}
              <Icon name="chevronDown" size={14} />
            </button>
          )}
          items={overflow.map((i) => ({ id: i.id, label: t(i.labelKey), icon: i.icon, onSelect: () => navigate(i.path) }))}
        />
      )}
    </nav>
  );
}

function HeaderActions() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const theme = useTheme();
  const { locale, setLocale, locales } = useLocale();
  const health = useAppSelector(selectOverallHealth);
  const navigate = useNavigate();

  return (
    <div className="header__actions">
      <Tooltip content={`${t('dashboard.systemHealth')}: ${t(`health.${health}`)}`} placement="bottom">
        <button type="button" className="health-pill" onClick={() => navigate('/observability')}>
          <span className={cx('health-dot', `tone-bg--${healthStatusTone[health]}`)} />
          <span className="hide-sm">{t(`health.${health}`)}</span>
        </button>
      </Tooltip>
      <DropdownMenu
        trigger={({ toggle }) => <IconButton icon="globe" label={t('settings.language')} onClick={toggle} />}
        items={locales.map((l) => ({
          id: l.code,
          label: l.nativeLabel,
          icon: l.code === locale ? 'check' : undefined,
          onSelect: () => setLocale(l.code),
        }))}
      />
      <IconButton icon={theme.scheme === 'dark' ? 'sun' : 'moon'} label={t('settings.theme')} onClick={theme.toggleScheme} />
      {user && (
        <DropdownMenu
          header={
            <div className="stack gap-xxs">
              <strong>{user.name}</strong>
              <span className="text-muted text-sm">{user.email}</span>
              <span>
                <Badge tone="primary">{user.roles.join(', ')}</Badge>
              </span>
            </div>
          }
          trigger={({ toggle }) => (
            <button type="button" className="user-btn" onClick={toggle} aria-label={user.name}>
              <Avatar name={user.name} size={32} status="online" />
            </button>
          )}
          items={[
            { id: 'settings', label: t('nav.settings'), icon: 'settings', onSelect: () => navigate('/settings') },
            { id: 'div', label: '', divider: true },
            { id: 'logout', label: t('nav.logout'), icon: 'logout', danger: true, onSelect: logout },
          ]}
        />
      )}
    </div>
  );
}

/**
 * Base framework - Web shell. The shared navigation layout rule chooses between
 * top tabs and a hamburger/side navigation (persistent when wide, drawer when narrow).
 */
export function AppShell() {
  const width = useViewportWidth();
  const { layout, tabs, overflow } = useNavigationLayout({ platform: 'web', viewportWidth: width, maxTabs: 5 });
  const shell = useShellState();
  const lifecycle = useAppLifecycle();
  const location = useLocation();
  const { t } = useTranslation();
  const narrow = width < 1024;

  useEffect(() => {
    shell.toggleMobileNav(false);
    window.scrollTo({ top: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const showSidebar = layout === 'hamburger';
  const collapsed = !narrow && shell.sidebarCollapsed;

  return (
    <div className={cx('shell', `shell--${layout}`, showSidebar && !narrow && 'shell--with-sidebar', collapsed && 'shell--collapsed')}>
      {showSidebar && !narrow && (
        <aside className="sidebar">
          <Brand collapsed={collapsed} />
          <SideNav collapsed={collapsed} />
          <button type="button" className="sidebar__collapse" onClick={() => shell.toggleSidebar()}>
            <Icon name="panel" size={16} />
            {!collapsed && <span>Collapse</span>}
          </button>
        </aside>
      )}
      {showSidebar && narrow && shell.mobileNavOpen && (
        <div className="overlay overlay--drawer-left" style={{ zIndex: 900 }}>
          <div className="overlay__backdrop" onClick={() => shell.toggleMobileNav(false)} />
          <aside className="drawer drawer--left sidebar sidebar--drawer">
            <div className="row justify-between">
              <Brand />
              <IconButton icon="x" label={t('common.close')} onClick={() => shell.toggleMobileNav(false)} />
            </div>
            <SideNav collapsed={false} onNavigate={() => shell.toggleMobileNav(false)} />
          </aside>
        </div>
      )}

      <div className="shell__main">
        <header className="header">
          <div className="row gap-sm">
            {showSidebar && narrow && (
              <IconButton icon="menu" label={t('nav.menu')} onClick={() => shell.toggleMobileNav(true)} />
            )}
            {(!showSidebar || narrow) && <Brand />}
          </div>
          {layout === 'tabs' && !narrow && <TopTabs tabs={tabs} overflow={overflow} />}
          <HeaderActions />
        </header>
        {layout === 'tabs' && narrow && <TopTabs tabs={tabs} overflow={overflow} />}

        {!lifecycle.online && (
          <div className="offline-banner">
            <Alert tone="warning">{t('errors.offline')}</Alert>
          </div>
        )}

        <main className="content" id="main">
          <ErrorBoundary
            key={location.pathname}
            scope={location.pathname}
            fallback={(error, reset) => (
              <Alert tone="danger" title={t('errors.boundaryTitle')} action={<Button size="sm" onClick={reset}>{t('errors.tryAgain')}</Button>}>
                {t('errors.boundaryBody')} <code>{error.message}</code>
              </Alert>
            )}
          >
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
    </div>
  );
}
