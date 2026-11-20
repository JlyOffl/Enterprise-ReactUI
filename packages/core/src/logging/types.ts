import type { SerializedError } from '../utils/errors';

export const LOG_LEVELS = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  fatal: 50,
} as const;

export type LogLevel = keyof typeof LOG_LEVELS;

export type LogData = Record<string, unknown>;

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  logger: string;
  data?: LogData;
  error?: SerializedError;
  context: LogData;
}

/** A log sink. Handlers are composed by the Logger (console, memory, Dynatrace, remote...). */
export interface LogHandler {
  readonly name: string;
  /** Optional per-handler threshold (e.g. only warn+ goes to Dynatrace). */
  minLevel?: LogLevel;
  handle(entry: LogEntry): void;
  flush?(): Promise<void>;
}

export function isLevelEnabled(level: LogLevel, threshold: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[threshold];
}
