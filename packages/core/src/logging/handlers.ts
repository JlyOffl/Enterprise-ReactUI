import { createObservableBuffer, type ObservableBuffer } from '../utils/observableBuffer';
import type { DynatraceBridge, DynatraceValue } from '../dynatrace/types';
import type { LogEntry, LogHandler, LogLevel } from './types';

/** Writes to the JS console with level-appropriate methods. */
export class ConsoleLogHandler implements LogHandler {
  readonly name = 'console';
  constructor(public minLevel?: LogLevel) {}

  handle(entry: LogEntry): void {
    const prefix = `[${entry.timestamp.slice(11, 23)}] ${entry.level.toUpperCase()} (${entry.logger})`;
    const payload = [prefix, entry.message, ...(entry.data ? [entry.data] : []), ...(entry.error ? [entry.error] : [])];
    switch (entry.level) {
      case 'debug':
        console.debug(...payload);
        break;
      case 'info':
        console.info(...payload);
        break;
      case 'warn':
        console.warn(...payload);
        break;
      default:
        console.error(...payload);
    }
  }
}

/** Keeps the latest N entries in memory; powers the in-app log viewer. */
export class MemoryLogHandler implements LogHandler {
  readonly name = 'memory';
  readonly buffer: ObservableBuffer<LogEntry>;
  constructor(capacity = 500) {
    this.buffer = createObservableBuffer<LogEntry>(capacity);
  }
  handle(entry: LogEntry): void {
    this.buffer.push(entry);
  }
}

/**
 * Batches entries and ships them to a remote collector. The transport is injected so
 * the same handler works with fetch on web and mobile.
 */
export class BatchingRemoteLogHandler implements LogHandler {
  readonly name = 'remote';
  private queue: LogEntry[] = [];
  private timer: ReturnType<typeof setInterval> | undefined;

  constructor(
    private readonly transport: (entries: LogEntry[]) => Promise<void>,
    public minLevel: LogLevel = 'info',
    private readonly batchSize = 20,
    flushIntervalMs = 10_000,
  ) {
    this.timer = setInterval(() => void this.flush(), flushIntervalMs);
  }

  handle(entry: LogEntry): void {
    this.queue.push(entry);
    if (this.queue.length >= this.batchSize) void this.flush();
  }

  async flush(): Promise<void> {
    if (!this.queue.length) return;
    const batch = this.queue.splice(0, this.queue.length);
    try {
      await this.transport(batch);
    } catch {
      this.queue.unshift(...batch.slice(-this.batchSize));
    }
  }

  dispose(): void {
    if (this.timer) clearInterval(this.timer);
  }
}

/**
 * Log handler -> Dynatrace. Platform specifics (RUM JS on web, OneAgent plugin on mobile)
 * live behind the DynatraceBridge interface implemented in each UI project.
 */
export class DynatraceLogHandler implements LogHandler {
  readonly name = 'dynatrace';
  constructor(
    private readonly bridge: DynatraceBridge,
    public minLevel: LogLevel = 'info',
  ) {}

  handle(entry: LogEntry): void {
    const properties: Record<string, DynatraceValue> = {
      'log.level': entry.level,
      'log.logger': entry.logger,
      'log.message': entry.message,
    };
    for (const [k, v] of Object.entries({ ...entry.context, ...entry.data })) {
      if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') properties[`ctx.${k}`] = v;
    }
    if (entry.level === 'error' || entry.level === 'fatal') {
      this.bridge.reportError(entry.error?.name ?? entry.message, entry.error ?? entry.message, properties);
    } else {
      this.bridge.reportEvent(`log.${entry.level}`, properties);
    }
  }
}
