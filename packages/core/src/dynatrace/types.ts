import { createId } from '../utils/id';
import { createObservableBuffer, type ObservableBuffer } from '../utils/observableBuffer';

export type DynatraceValue = string | number | boolean;
export type DynatraceProperties = Record<string, DynatraceValue>;

/** A user action / span. Maps to dtrum.enterAction on web and Dynatrace.enterManualAction on mobile. */
export interface DynatraceAction {
  readonly name: string;
  reportValue(key: string, value: DynatraceValue): void;
  reportError(name: string, code?: number): void;
  leave(): void;
}

/**
 * Platform abstraction over Dynatrace RUM.
 * - Web implementation: apps/web/src/platform/dynatraceWebBridge.ts (RUM JavaScript API `dtrum`)
 * - Mobile implementation: apps/mobile/src/platform/dynatraceNativeBridge.ts (@dynatrace/react-native-plugin)
 */
export interface DynatraceBridge {
  readonly name: string;
  isAvailable(): boolean;
  identifyUser(userId: string | null): void;
  enterAction(name: string): DynatraceAction;
  reportError(name: string, error?: unknown, properties?: DynatraceProperties): void;
  reportEvent(name: string, properties?: DynatraceProperties): void;
  endSession(): void;
}

const noopAction = (name: string): DynatraceAction => ({
  name,
  reportValue: () => undefined,
  reportError: () => undefined,
  leave: () => undefined,
});

export class NoopDynatraceBridge implements DynatraceBridge {
  readonly name = 'noop';
  isAvailable = () => false;
  identifyUser = () => undefined;
  enterAction = (name: string) => noopAction(name);
  reportError = () => undefined;
  reportEvent = () => undefined;
  endSession = () => undefined;
}

export interface DynatraceCall {
  id: string;
  at: string;
  method: 'identifyUser' | 'enterAction' | 'leaveAction' | 'reportValue' | 'reportError' | 'reportEvent' | 'endSession';
  name: string;
  payload?: Record<string, unknown>;
  delivered: boolean;
}

/**
 * Decorator that records every call (the "Dynatrace outbox") before forwarding it to the real
 * bridge. When Dynatrace is disabled the inner bridge is a noop, giving a dry-run view.
 */
export class ObservableDynatraceBridge implements DynatraceBridge {
  readonly name: string;
  readonly calls: ObservableBuffer<DynatraceCall>;

  constructor(
    private readonly inner: DynatraceBridge,
    capacity = 300,
  ) {
    this.name = `observable(${inner.name})`;
    this.calls = createObservableBuffer<DynatraceCall>(capacity);
  }

  private record(method: DynatraceCall['method'], name: string, payload?: Record<string, unknown>) {
    this.calls.push({
      id: createId(),
      at: new Date().toISOString(),
      method,
      name,
      payload,
      delivered: this.inner.isAvailable(),
    });
  }

  isAvailable(): boolean {
    return this.inner.isAvailable();
  }

  identifyUser(userId: string | null): void {
    this.record('identifyUser', userId ?? '(anonymous)');
    this.inner.identifyUser(userId);
  }

  enterAction(name: string): DynatraceAction {
    this.record('enterAction', name);
    const action = this.inner.enterAction(name);
    return {
      name,
      reportValue: (key, value) => {
        this.record('reportValue', name, { [key]: value });
        action.reportValue(key, value);
      },
      reportError: (errName, code) => {
        this.record('reportError', name, { error: errName, code });
        action.reportError(errName, code);
      },
      leave: () => {
        this.record('leaveAction', name);
        action.leave();
      },
    };
  }

  reportError(name: string, error?: unknown, properties?: DynatraceProperties): void {
    this.record('reportError', name, { ...properties, error: error instanceof Error ? error.message : error });
    this.inner.reportError(name, error, properties);
  }

  reportEvent(name: string, properties?: DynatraceProperties): void {
    this.record('reportEvent', name, properties);
    this.inner.reportEvent(name, properties);
  }

  endSession(): void {
    this.record('endSession', 'session');
    this.inner.endSession();
  }
}
