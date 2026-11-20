import { createId, now } from '../utils/id';
import { createObservableBuffer, type ObservableBuffer } from '../utils/observableBuffer';
import type { DynatraceBridge, DynatraceProperties } from '../dynatrace/types';
import type { Logger } from '../logging/Logger';

export type AnalyticsProps = Record<string, string | number | boolean | undefined>;

export interface AnalyticsEvent {
  id: string;
  type: 'event' | 'screen' | 'timing' | 'identify';
  name: string;
  properties?: AnalyticsProps;
  durationMs?: number;
  timestamp: string;
}

export interface AnalyticsHandler {
  readonly name: string;
  handle(event: AnalyticsEvent): void;
}

/**
 * Instrumentation / analytics facade. Components and business logic call this service;
 * handlers fan the events out to vendors (Dynatrace, console, memory, ...).
 */
export class AnalyticsService {
  private enabled = true;
  private superProps: AnalyticsProps = {};

  constructor(
    private readonly handlers: AnalyticsHandler[],
    private readonly logger: Logger,
  ) {}

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  /** Properties attached to every event (app version, platform, tenant...). */
  register(props: AnalyticsProps) {
    this.superProps = { ...this.superProps, ...props };
  }

  addHandler(handler: AnalyticsHandler) {
    if (!this.handlers.some((h) => h.name === handler.name)) this.handlers.push(handler);
  }

  track(name: string, properties?: AnalyticsProps) {
    this.emit({ type: 'event', name, properties });
  }

  screen(name: string, properties?: AnalyticsProps) {
    this.emit({ type: 'screen', name, properties });
  }

  timing(name: string, durationMs: number, properties?: AnalyticsProps) {
    this.emit({ type: 'timing', name, durationMs: Math.round(durationMs), properties });
  }

  identify(userId: string | null, traits?: AnalyticsProps) {
    this.emit({ type: 'identify', name: userId ?? 'anonymous', properties: traits });
  }

  /** Starts a timer; call the returned function to record the timing. */
  startTimer(name: string, properties?: AnalyticsProps): (extra?: AnalyticsProps) => number {
    const start = now();
    return (extra) => {
      const duration = now() - start;
      this.timing(name, duration, { ...properties, ...extra });
      return duration;
    };
  }

  private emit(partial: Omit<AnalyticsEvent, 'id' | 'timestamp'>) {
    if (!this.enabled) return;
    const event: AnalyticsEvent = {
      ...partial,
      properties: { ...this.superProps, ...partial.properties },
      id: createId(),
      timestamp: new Date().toISOString(),
    };
    for (const handler of this.handlers) {
      try {
        handler.handle(event);
      } catch (error) {
        this.logger.warn('Analytics handler failed', { handler: handler.name }, error);
      }
    }
  }
}

export class MemoryAnalyticsHandler implements AnalyticsHandler {
  readonly name = 'memory';
  readonly buffer: ObservableBuffer<AnalyticsEvent> = createObservableBuffer<AnalyticsEvent>(300);
  handle(event: AnalyticsEvent) {
    this.buffer.push(event);
  }
}

export class LoggerAnalyticsHandler implements AnalyticsHandler {
  readonly name = 'logger';
  constructor(private readonly logger: Logger) {}
  handle(event: AnalyticsEvent) {
    this.logger.debug(`analytics.${event.type}: ${event.name}`, { ...event.properties, durationMs: event.durationMs });
  }
}

/** Instrumentation handler -> Dynatrace (web + native share this; the bridge is platform specific). */
export class DynatraceAnalyticsHandler implements AnalyticsHandler {
  readonly name = 'dynatrace';
  constructor(private readonly bridge: DynatraceBridge) {}

  handle(event: AnalyticsEvent) {
    const props: DynatraceProperties = {};
    for (const [k, v] of Object.entries(event.properties ?? {})) if (v !== undefined) props[k] = v;
    switch (event.type) {
      case 'identify':
        this.bridge.identifyUser(event.name === 'anonymous' ? null : event.name);
        break;
      case 'screen': {
        const action = this.bridge.enterAction(`Screen: ${event.name}`);
        Object.entries(props).forEach(([k, v]) => action.reportValue(k, v));
        action.leave();
        break;
      }
      case 'timing': {
        const action = this.bridge.enterAction(`Timing: ${event.name}`);
        action.reportValue('durationMs', event.durationMs ?? 0);
        action.leave();
        break;
      }
      default:
        this.bridge.reportEvent(event.name, props);
    }
  }
}
