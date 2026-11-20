import type { DynatraceAction, DynatraceBridge, DynatraceProperties } from '@erui/core';

/** Subset of the Dynatrace RUM JavaScript API (window.dtrum). */
interface Dtrum {
  enterAction(name: string, actionType?: string, startTime?: number, sourceUrl?: string): number;
  leaveAction(actionId: number, stopTime?: number, startTime?: number): void;
  reportError(error: Error | string, parentActionId?: number): void;
  identifyUser(value: string): void;
  endSession(): void;
  addActionProperties(
    parentActionId: number,
    javaLong?: Record<string, number>,
    date?: Record<string, Date>,
    shortString?: Record<string, string>,
    javaDouble?: Record<string, number>,
  ): void;
}

interface DynatraceGlobal {
  sendBizEvent?(type: string, attributes: Record<string, unknown>): void;
}

declare global {
  interface Window {
    dtrum?: Dtrum;
    dynatrace?: DynatraceGlobal;
  }
}

function splitProperties(props: DynatraceProperties = {}) {
  const strings: Record<string, string> = {};
  const doubles: Record<string, number> = {};
  for (const [k, v] of Object.entries(props)) {
    const key = k.replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();
    if (typeof v === 'number') doubles[key] = v;
    else strings[key] = String(v).slice(0, 100);
  }
  return { strings, doubles };
}

/** Dynatrace bridge for the browser (RUM JavaScript agent). Safe no-op when the agent is absent. */
export class DynatraceWebBridge implements DynatraceBridge {
  readonly name = 'dynatrace-rum-js';

  private get dtrum(): Dtrum | undefined {
    return typeof window !== 'undefined' ? window.dtrum : undefined;
  }

  isAvailable(): boolean {
    return !!this.dtrum;
  }

  identifyUser(userId: string | null): void {
    if (userId) this.dtrum?.identifyUser(userId);
  }

  enterAction(name: string): DynatraceAction {
    const dtrum = this.dtrum;
    const id = dtrum?.enterAction(name, 'custom') ?? 0;
    return {
      name,
      reportValue: (key, value) => {
        if (!dtrum || !id) return;
        const { strings, doubles } = splitProperties({ [key]: value });
        dtrum.addActionProperties(id, undefined, undefined, strings, doubles);
      },
      reportError: (errName) => dtrum?.reportError(errName, id || undefined),
      leave: () => id && dtrum?.leaveAction(id),
    };
  }

  reportError(name: string, error?: unknown, properties?: DynatraceProperties): void {
    const dtrum = this.dtrum;
    if (!dtrum) return;
    const err = error instanceof Error ? error : new Error(typeof error === 'string' ? error : name);
    const id = dtrum.enterAction(`Error: ${name}`, 'custom');
    const { strings, doubles } = splitProperties(properties);
    dtrum.addActionProperties(id, undefined, undefined, strings, doubles);
    dtrum.reportError(err, id);
    dtrum.leaveAction(id);
  }

  reportEvent(name: string, properties?: DynatraceProperties): void {
    if (window.dynatrace?.sendBizEvent) {
      window.dynatrace.sendBizEvent(`com.erui.${name}`, { ...properties });
      return;
    }
    const dtrum = this.dtrum;
    if (!dtrum) return;
    const id = dtrum.enterAction(name, 'custom');
    const { strings, doubles } = splitProperties(properties);
    dtrum.addActionProperties(id, undefined, undefined, strings, doubles);
    dtrum.leaveAction(id);
  }

  endSession(): void {
    this.dtrum?.endSession();
  }
}

/** Injects the RUM JavaScript tag (copy the "JavaScript tag" URL from Dynatrace). */
export function loadDynatraceRum(scriptUrl?: string): void {
  if (!scriptUrl || document.querySelector('script[data-dynatrace]')) return;
  const script = document.createElement('script');
  script.src = scriptUrl;
  script.crossOrigin = 'anonymous';
  script.dataset.dynatrace = 'true';
  document.head.prepend(script);
}
