import { Component, useEffect, type ErrorInfo, type ReactNode } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import type { i18n as I18nInstance } from 'i18next';
import type { Container } from 'inversify';
import { DIContext, DIProvider } from '../di/DIProvider';
import { TYPES } from '../di/tokens';
import { useAppSelector } from '../store/hooks';
import { selectLocale } from '../ui/uiSlice';
import type { Logger } from '../logging/Logger';
import type { Application } from './createApplication';

function LocaleSync({ i18n }: { i18n: I18nInstance }) {
  const locale = useAppSelector(selectLocale);
  useEffect(() => {
    if (i18n.language !== locale) void i18n.changeLanguage(locale);
  }, [locale, i18n]);
  return null;
}

/** Starts the application once and disposes it on unmount. */
function AppStarter({ app }: { app: Application }) {
  useEffect(() => {
    void app.start();
    return () => app.dispose();
  }, [app]);
  return null;
}

/** Platform-agnostic provider stack: Redux + IoC + i18n + lifecycle start. */
export function AppProviders({ app, children }: { app: Application; children: ReactNode }) {
  return (
    <ReduxProvider store={app.store}>
      <DIProvider container={app.container}>
        <I18nextProvider i18n={app.i18n}>
          <LocaleSync i18n={app.i18n} />
          <AppStarter app={app} />
          {children}
        </I18nextProvider>
      </DIProvider>
    </ReduxProvider>
  );
}

export interface ErrorBoundaryProps {
  scope?: string;
  fallback: (error: Error, reset: () => void) => ReactNode;
  children: ReactNode;
}

/** Catches render errors and reports them through the logging framework (-> Dynatrace). */
export class ErrorBoundary extends Component<ErrorBoundaryProps, { error: Error | null }> {
  // No `declare`/`override` class modifiers here: React Native's Babel pipeline (Flow plugin)
  // rejects `declare` fields in files outside the app, so keep this class plain.
  static contextType = DIContext;
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    (this.context as Container | null)
      ?.get<Logger>(TYPES.Logger)
      .fatal('React render error', error, { scope: this.props.scope ?? 'root', componentStack: info.componentStack ?? '' });
  }

  reset = () => this.setState({ error: null });

  render() {
    return this.state.error ? this.props.fallback(this.state.error, this.reset) : this.props.children;
  }
}
