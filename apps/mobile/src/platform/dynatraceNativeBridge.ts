import type { DynatraceAction, DynatraceBridge, DynatraceProperties } from '@erui/core';

/** Subset of @dynatrace/react-native-plugin used by the bridge (API differs slightly across versions). */
interface NativeAction {
  reportStringValue?(key: string, value: string): void;
  reportDoubleValue?(key: string, value: number): void;
  reportIntValue?(key: string, value: number): void;
  reportError?(name: string, code: number): void;
  leaveAction(): void;
}

interface NativeDynatrace {
  enterManualAction?(name: string): NativeAction;
  enterAction?(name: string): NativeAction;
  identifyUser(user: string): void;
  reportErrorWithStacktrace?(errorName: string, reason: string, stacktrace: string): void;
  reportError?(name: string, code: number): void;
  sendBizEvent?(type: string, attributes: Record<string, unknown>): void;
  endSession(): void;
}

function loadAgent(): NativeDynatrace | undefined {
  try {
    // Loaded lazily so Expo Go / un-instrumented builds keep working.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@dynatrace/react-native-plugin') as { Dynatrace?: NativeDynatrace };
    return mod.Dynatrace;
  } catch {
    return undefined;
  }
}

/** Dynatrace bridge for React Native (OneAgent via @dynatrace/react-native-plugin). */
export class DynatraceNativeBridge implements DynatraceBridge {
  readonly name = 'dynatrace-react-native';
  private readonly agent = loadAgent();

  private safe(fn: (agent: NativeDynatrace) => void) {
    if (!this.agent) return;
    try {
      fn(this.agent);
    } catch {
      /* agent not started (e.g. Expo Go) */
    }
  }

  isAvailable(): boolean {
    return !!this.agent;
  }

  identifyUser(userId: string | null): void {
    if (userId) this.safe((a) => a.identifyUser(userId));
  }

  enterAction(name: string): DynatraceAction {
    let action: NativeAction | undefined;
    this.safe((a) => (action = (a.enterManualAction ?? a.enterAction)?.call(a, name)));
    return {
      name,
      reportValue: (key, value) => {
        if (!action) return;
        if (typeof value === 'number') (action.reportDoubleValue ?? action.reportIntValue)?.call(action, key, value);
        else action.reportStringValue?.(key, String(value));
      },
      reportError: (errName, code = 0) => action?.reportError?.(errName, code),
      leave: () => action?.leaveAction(),
    };
  }

  reportError(name: string, error?: unknown, properties?: DynatraceProperties): void {
    const reason = error instanceof Error ? error.message : typeof error === 'string' ? error : JSON.stringify(properties ?? {});
    const stack = error instanceof Error ? (error.stack ?? '') : '';
    this.safe((a) => (a.reportErrorWithStacktrace ? a.reportErrorWithStacktrace(name, reason, stack) : a.reportError?.(name, -1)));
  }

  reportEvent(name: string, properties?: DynatraceProperties): void {
    this.safe((a) => {
      if (a.sendBizEvent) {
        a.sendBizEvent(`com.erui.${name}`, { ...properties });
        return;
      }
      const action = (a.enterManualAction ?? a.enterAction)?.call(a, name);
      Object.entries(properties ?? {}).forEach(([k, v]) =>
        typeof v === 'number' ? action?.reportDoubleValue?.(k, v) : action?.reportStringValue?.(k, String(v)),
      );
      action?.leaveAction();
    });
  }

  endSession(): void {
    this.safe((a) => a.endSession());
  }
}
