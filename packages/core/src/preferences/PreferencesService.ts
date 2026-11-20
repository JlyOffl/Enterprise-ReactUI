import type { KeyValueStorage } from '../platform/types';
import type { PersistedPreferences } from '../store/actions';
import type { Logger } from '../logging/Logger';

const KEY = 'erui.preferences';

/** Persists user preferences (theme, locale, nav layout, density, flag overrides). */
export class PreferencesService {
  constructor(
    private readonly storage: KeyValueStorage,
    private readonly logger: Logger,
  ) {}

  async load(): Promise<PersistedPreferences> {
    try {
      const raw = await this.storage.getItem(KEY);
      return raw ? (JSON.parse(raw) as PersistedPreferences) : {};
    } catch (error) {
      this.logger.warn('Failed to load preferences', undefined, error);
      return {};
    }
  }

  async save(prefs: PersistedPreferences): Promise<void> {
    try {
      await this.storage.setItem(KEY, JSON.stringify(prefs));
    } catch (error) {
      this.logger.warn('Failed to save preferences', undefined, error);
    }
  }

  async clear(): Promise<void> {
    await this.storage.removeItem(KEY);
  }
}
