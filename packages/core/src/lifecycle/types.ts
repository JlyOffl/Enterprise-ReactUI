export type AppVisibility = 'foreground' | 'background';
export type LifecyclePhase = 'booting' | 'initializing' | 'ready' | 'error';

/** Implemented per platform: document.visibilityState / AppState, navigator.onLine / NetInfo, etc. */
export interface PlatformLifecycleAdapter {
  getInitialVisibility(): AppVisibility;
  getInitialOnline(): boolean;
  subscribeVisibility(callback: (visibility: AppVisibility) => void): () => void;
  subscribeConnectivity(callback: (online: boolean) => void): () => void;
  /** window.onerror + unhandledrejection on web, ErrorUtils on React Native. */
  subscribeGlobalErrors(callback: (error: unknown, isFatal: boolean) => void): () => void;
  /** beforeunload on web; not available on mobile. */
  subscribeBeforeExit?(callback: () => void): () => void;
}

export interface StartupTaskContext {
  signal: AbortSignal;
}

export interface StartupTask {
  name: string;
  /** Critical task failures put the app in the `error` phase. */
  critical?: boolean;
  /** Lower runs first. Tasks with the same order run in parallel. */
  order?: number;
  run(ctx: StartupTaskContext): Promise<void> | void;
}

export interface StartupTiming {
  name: string;
  durationMs: number;
  ok: boolean;
  error?: string;
}
