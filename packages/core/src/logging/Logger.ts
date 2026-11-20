import { createId } from '../utils/id';
import { serializeError } from '../utils/errors';
import { isLevelEnabled, type LogData, type LogEntry, type LogHandler, type LogLevel } from './types';

interface LoggerShared {
  handlers: LogHandler[];
  minLevel: LogLevel;
  contextProvider?: () => LogData;
}

/**
 * Logging framework base.
 * - Level filtering (global + per handler)
 * - Structured data + contextual enrichment (user, locale, session...)
 * - Child loggers share handlers/level but add their own scope/context
 * - Handler failures never break the app
 */
export class Logger {
  private constructor(
    private readonly shared: LoggerShared,
    private readonly scope: string,
    private readonly context: LogData,
  ) {}

  static create(handlers: LogHandler[], minLevel: LogLevel = 'debug', context: LogData = {}): Logger {
    return new Logger({ handlers: [...handlers], minLevel }, 'app', context);
  }

  child(scope: string, context: LogData = {}): Logger {
    return new Logger(this.shared, scope, { ...this.context, ...context });
  }

  setLevel(level: LogLevel): void {
    this.shared.minLevel = level;
  }

  getLevel(): LogLevel {
    return this.shared.minLevel;
  }

  setContextProvider(provider: () => LogData): void {
    this.shared.contextProvider = provider;
  }

  addHandler(handler: LogHandler): void {
    if (!this.shared.handlers.some((h) => h.name === handler.name)) this.shared.handlers.push(handler);
  }

  removeHandler(name: string): void {
    this.shared.handlers = this.shared.handlers.filter((h) => h.name !== name);
  }

  getHandlers(): readonly LogHandler[] {
    return this.shared.handlers;
  }

  debug(message: string, data?: LogData): void {
    this.log('debug', message, data);
  }

  info(message: string, data?: LogData): void {
    this.log('info', message, data);
  }

  warn(message: string, data?: LogData, error?: unknown): void {
    this.log('warn', message, data, error);
  }

  error(message: string, error?: unknown, data?: LogData): void {
    this.log('error', message, data, error);
  }

  fatal(message: string, error?: unknown, data?: LogData): void {
    this.log('fatal', message, data, error);
  }

  log(level: LogLevel, message: string, data?: LogData, error?: unknown): void {
    if (!isLevelEnabled(level, this.shared.minLevel)) return;
    let dynamicContext: LogData = {};
    try {
      dynamicContext = this.shared.contextProvider?.() ?? {};
    } catch {
      /* ignore context failures */
    }
    const entry: LogEntry = {
      id: createId(),
      timestamp: new Date().toISOString(),
      level,
      message,
      logger: this.scope,
      data,
      error: error === undefined ? undefined : serializeError(error),
      context: { ...this.context, ...dynamicContext },
    };
    for (const handler of this.shared.handlers) {
      if (handler.minLevel && !isLevelEnabled(level, handler.minLevel)) continue;
      try {
        handler.handle(entry);
      } catch {
        /* a broken sink must never crash the app */
      }
    }
  }

  async flush(): Promise<void> {
    await Promise.all(this.shared.handlers.map((h) => h.flush?.().catch(() => undefined)));
  }
}
