const SEPARATOR = '::';

/**
 * Validation messages are i18n keys (+ optional params) so the same zod schema can be
 * localized on any platform: vmsg('validation.minLength', { count: 8 }).
 */
export function vmsg(key: string, params?: Record<string, unknown>): string {
  return params ? `${key}${SEPARATOR}${JSON.stringify(params)}` : key;
}

export function parseValidationMessage(message: string): { key: string; params?: Record<string, unknown> } {
  const i = message.indexOf(SEPARATOR);
  if (i < 0) return { key: message };
  try {
    return { key: message.slice(0, i), params: JSON.parse(message.slice(i + SEPARATOR.length)) };
  } catch {
    return { key: message.slice(0, i) };
  }
}
