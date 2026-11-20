import { hashString } from '../utils/id';
import type { Logger } from '../logging/Logger';
import { FLAG_DEFINITIONS, type FeatureFlagDefinition } from './definitions';

export interface FlagEvaluationContext {
  userId?: string;
  roles?: string[];
  platform?: string;
  appVersion?: string;
}

/** A source of flag values (static defaults, remote config service, LaunchDarkly, etc.). */
export interface FeatureFlagProvider {
  readonly name: string;
  load(context: FlagEvaluationContext): Promise<Record<string, boolean>>;
}

/** Defaults + deterministic percentage rollouts. */
export class DefaultsFlagProvider implements FeatureFlagProvider {
  readonly name = 'defaults';
  constructor(private readonly definitions: FeatureFlagDefinition[] = FLAG_DEFINITIONS) {}
  async load(context: FlagEvaluationContext) {
    return Object.fromEntries(
      this.definitions.map((d) => [
        d.key,
        d.rolloutPercentage !== undefined && context.userId
          ? hashString(`${d.key}:${context.userId}`) % 100 < d.rolloutPercentage
          : d.defaultValue,
      ]),
    );
  }
}

/** Remote provider; the fetcher is injected (RTK Query endpoint, SDK call...). */
export class RemoteFlagProvider implements FeatureFlagProvider {
  readonly name = 'remote';
  constructor(private readonly fetcher: (context: FlagEvaluationContext) => Promise<Record<string, boolean>>) {}
  load(context: FlagEvaluationContext) {
    return this.fetcher(context);
  }
}

/**
 * Feature flag service. Providers are merged in registration order (later wins).
 * A failing provider is logged and skipped so the app always has a usable flag set.
 */
export class FeatureFlagService {
  private providers: FeatureFlagProvider[] = [];
  private readonly log: Logger;

  constructor(logger: Logger) {
    this.log = logger.child('flags');
    this.providers.push(new DefaultsFlagProvider());
  }

  get definitions(): FeatureFlagDefinition[] {
    return FLAG_DEFINITIONS;
  }

  addProvider(provider: FeatureFlagProvider): void {
    this.providers = [...this.providers.filter((p) => p.name !== provider.name), provider];
  }

  async load(context: FlagEvaluationContext): Promise<{ values: Record<string, boolean>; source: 'defaults' | 'remote' }> {
    let values: Record<string, boolean> = {};
    let source: 'defaults' | 'remote' = 'defaults';
    for (const provider of this.providers) {
      try {
        values = { ...values, ...(await provider.load(context)) };
        if (provider.name !== 'defaults') source = 'remote';
      } catch (error) {
        this.log.warn(`Flag provider "${provider.name}" failed`, undefined, error);
      }
    }
    this.log.debug('Feature flags evaluated', { source, count: Object.keys(values).length });
    return { values, source };
  }
}
