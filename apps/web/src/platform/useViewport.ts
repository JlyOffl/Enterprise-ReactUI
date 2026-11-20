import { useSyncExternalStore } from 'react';

const subscribe = (cb: () => void) => {
  window.addEventListener('resize', cb);
  return () => window.removeEventListener('resize', cb);
};

/** Current viewport width (drives the shared tabs-vs-hamburger rule). */
export function useViewportWidth(): number {
  return useSyncExternalStore(subscribe, () => window.innerWidth, () => 1280);
}

export function useIsNarrow(breakpoint = 1024): boolean {
  return useViewportWidth() < breakpoint;
}
