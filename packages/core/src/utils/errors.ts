export interface SerializedError {
  name: string;
  message: string;
  stack?: string;
  code?: string | number;
}

export function serializeError(error: unknown): SerializedError {
  if (error instanceof Error) {
    return { name: error.name, message: error.message, stack: error.stack };
  }
  if (typeof error === 'object' && error !== null) {
    const e = error as Record<string, unknown>;
    return {
      name: String(e.name ?? 'Error'),
      message: String(e.message ?? e.error ?? JSON.stringify(error)),
      code: (e.status ?? e.code) as string | number | undefined,
    };
  }
  return { name: 'Error', message: String(error) };
}

/** Extracts a human-friendly message from RTK Query / fetch / thrown errors. */
export function getErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (!error) return fallback;
  if (typeof error === 'string') return error;
  if (error instanceof Error) return error.message;
  if (typeof error === 'object') {
    const e = error as { data?: { message?: string }; error?: string; message?: string };
    return e.data?.message ?? e.message ?? e.error ?? fallback;
  }
  return fallback;
}
