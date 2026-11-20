import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { Container, interfaces } from 'inversify';

export const DIContext = createContext<Container | null>(null);

export function DIProvider({ container, children }: { container: Container; children: ReactNode }) {
  return <DIContext.Provider value={container}>{children}</DIContext.Provider>;
}

export function useContainer(): Container {
  const container = useContext(DIContext);
  if (!container) throw new Error('useContainer must be used inside <DIProvider>');
  return container;
}

/** Resolves a service from the IoC container (memoized per component). */
export function useService<T>(identifier: interfaces.ServiceIdentifier<T>): T {
  const container = useContainer();
  return useMemo(() => container.get<T>(identifier), [container, identifier]);
}
