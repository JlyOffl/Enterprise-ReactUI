export type FlagCategory = 'module' | 'ui' | 'experimental' | 'ops';

export interface FeatureFlagDefinition {
  key: string;
  description: string;
  category: FlagCategory;
  defaultValue: boolean;
  /** Optional gradual rollout (0-100) evaluated per user when no remote value exists. */
  rolloutPercentage?: number;
}

export const FLAGS = {
  ordersModule: 'module.orders',
  externalSystemsModule: 'module.externalSystems',
  dashboardV2Widgets: 'dashboard.v2Widgets',
  dynamicForms: 'forms.dynamicForms',
  modelessWindows: 'ui.modelessWindows',
  ordersBulkActions: 'orders.bulkActions',
  aiAssist: 'experimental.aiAssist',
  compactDensity: 'ui.compactDensityToggle',
} as const;

export type FlagKey = (typeof FLAGS)[keyof typeof FLAGS] | (string & {});

export const FLAG_DEFINITIONS: FeatureFlagDefinition[] = [
  { key: FLAGS.ordersModule, description: 'Enables the Orders feature module', category: 'module', defaultValue: true },
  { key: FLAGS.externalSystemsModule, description: 'Enables the External Systems module', category: 'module', defaultValue: true },
  { key: FLAGS.dashboardV2Widgets, description: 'Revenue trend and activity widgets on the dashboard', category: 'ui', defaultValue: false },
  { key: FLAGS.dynamicForms, description: 'Schema driven forms (component factory)', category: 'ui', defaultValue: true },
  { key: FLAGS.modelessWindows, description: 'Floating, non-blocking modeless windows', category: 'ui', defaultValue: true },
  { key: FLAGS.ordersBulkActions, description: 'Bulk approve/cancel in the orders list', category: 'experimental', defaultValue: false },
  { key: FLAGS.aiAssist, description: 'AI assisted form completion', category: 'experimental', defaultValue: false },
  {
    key: FLAGS.compactDensity,
    description: 'Lets users switch to compact density',
    category: 'ui',
    defaultValue: false,
    rolloutPercentage: 50,
  },
];
