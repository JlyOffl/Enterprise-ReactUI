import { AppProviders, createApplication, ErrorBoundary } from '@erui/core';
import { createWebPlatform, webConfig } from './platform/webPlatform';
import { ThemeStyleSync } from './theme/ThemeStyleSync';
import { AppRouter } from './routes/AppRouter';
import { ModalHost, ToastHost } from './components/ui';
import { modalRegistry } from './modals/registry';

/**
 * Application framework - Web entry. The shared core is composed with web platform
 * services; only rendering lives in this project.
 */
const app = createApplication({ platform: createWebPlatform(), config: webConfig });

export function App() {
  return (
    <AppProviders app={app}>
      <ThemeStyleSync />
      <ErrorBoundary
        scope="root"
        fallback={(error, reset) => (
          <div className="boot">
            <h2>Something went wrong</h2>
            <code>{error.message}</code>
            <button className="btn btn--primary btn--md" onClick={reset}>
              Try again
            </button>
          </div>
        )}
      >
        <AppRouter />
        <ModalHost registry={modalRegistry} />
        <ToastHost />
      </ErrorBoundary>
    </AppProviders>
  );
}
