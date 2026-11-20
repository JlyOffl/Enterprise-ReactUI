import type { AppConfig } from '../config/appConfig';
import type { PlatformServices } from '../platform/types';

export interface ExternalSystem {
  id: string;
  name: string;
  description: string;
  /** Validation pattern for identifiers issued by that system. */
  pattern: RegExp;
  example: string;
  color: string;
  deepLink?: (externalId: string) => string;
}

export interface ExternalIdValidation {
  valid: boolean;
  messageKey?: string;
}

const DEFAULT_SYSTEMS: ExternalSystem[] = [
  {
    id: 'salesforce',
    name: 'Salesforce CRM',
    description: 'Contact record id (15/18 chars, prefix 003)',
    pattern: /^003[A-Za-z0-9]{12}(?:[A-Za-z0-9]{3})?$/,
    example: '003Hx00000AbCdEf',
    color: '#00A1E0',
    deepLink: (id) => `https://contoso.lightning.force.com/lightning/r/Contact/${id}/view`,
  },
  {
    id: 'sap',
    name: 'SAP S/4HANA',
    description: 'Business partner number (10 digits)',
    pattern: /^\d{10}$/,
    example: '1000007919',
    color: '#0FAAFF',
  },
  {
    id: 'workday',
    name: 'Workday HCM',
    description: 'Worker id (WD-######)',
    pattern: /^WD-\d{6}$/,
    example: 'WD-100037',
    color: '#F5A623',
  },
  {
    id: 'servicenow',
    name: 'ServiceNow',
    description: 'sys_id prefix (SYS + 8 hex chars)',
    pattern: /^SYS[0-9a-f]{8}$/,
    example: 'SYS1001992a',
    color: '#81B5A1',
    deepLink: (id) => `https://contoso.service-now.com/nav_to.do?uri=sys_user.do?sys_id=${id}`,
  },
];

/**
 * External System Id support:
 * - identifies THIS client to downstream services (X-External-System-Id header)
 * - registry of integrated systems with id validation, formatting and deep links
 * - resolves an entity's identifier in a given external system
 */
export class ExternalSystemService {
  private systems = new Map<string, ExternalSystem>();

  constructor(
    private readonly config: AppConfig,
    private readonly platform: PlatformServices,
  ) {
    DEFAULT_SYSTEMS.forEach((s) => this.register(s));
  }

  get clientSystemId(): string {
    return this.config.externalSystemId;
  }

  register(system: ExternalSystem): void {
    this.systems.set(system.id, system);
  }

  list(): ExternalSystem[] {
    return [...this.systems.values()];
  }

  get(systemId: string): ExternalSystem | undefined {
    return this.systems.get(systemId);
  }

  validate(systemId: string, value: string): ExternalIdValidation {
    const system = this.get(systemId);
    if (!system) return { valid: false, messageKey: 'externalSystems.unknownSystem' };
    if (!value.trim()) return { valid: false, messageKey: 'validation.required' };
    return system.pattern.test(value.trim())
      ? { valid: true }
      : { valid: false, messageKey: 'externalSystems.invalidFormat' };
  }

  resolve(entity: { externalIds?: Record<string, string> } | null | undefined, systemId: string): string | undefined {
    return entity?.externalIds?.[systemId];
  }

  deepLink(systemId: string, externalId: string): string | undefined {
    return this.get(systemId)?.deepLink?.(externalId);
  }

  /** Headers attached to every outbound API request. */
  buildRequestHeaders(correlationId: string): Record<string, string> {
    return {
      'X-External-System-Id': this.config.externalSystemId,
      'X-Correlation-Id': correlationId,
      'X-Client-Platform': this.platform.kind,
      'X-Client-Version': this.config.version,
    };
  }
}
