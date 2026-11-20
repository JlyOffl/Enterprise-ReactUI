import { defineModule } from '../../composable/FeatureModule';
import { FLAGS } from '../../featureFlags/definitions';
import type { TreeNode } from '../../headless/collections';

/** Framework showcase screens (controls, forms, dynamic forms, modals). */
export const showcaseModule = defineModule({
  id: 'showcase',
  navItems: [
    { id: 'controls', path: '/controls', labelKey: 'nav.controls', icon: 'grid', section: 'framework', order: 20, primary: true },
    { id: 'forms', path: '/forms', labelKey: 'nav.forms', icon: 'form', section: 'framework', order: 50 },
    { id: 'dynamicForms', path: '/dynamic-forms', labelKey: 'nav.dynamicForms', icon: 'layers', section: 'framework', order: 55, featureFlag: FLAGS.dynamicForms },
    { id: 'modals', path: '/modals', labelKey: 'nav.modals', icon: 'window', section: 'framework', order: 60 },
  ],
});

/** External systems module (feature flagged). */
export const externalSystemsModule = defineModule({
  id: 'external-systems',
  featureFlag: FLAGS.externalSystemsModule,
  navItems: [
    { id: 'externalSystems', path: '/external-systems', labelKey: 'nav.externalSystems', icon: 'link', section: 'admin', order: 80, permission: 'integrations:read' },
  ],
});

/** Sample data used by the controls gallery on both platforms. */
export const SAMPLE_TREE: TreeNode[] = [
  {
    id: 'org',
    label: 'Contoso Health',
    children: [
      {
        id: 'eng',
        label: 'Engineering',
        children: [
          { id: 'eng-web', label: 'Web platform' },
          { id: 'eng-mobile', label: 'Mobile' },
          { id: 'eng-dr', label: 'Disaster recovery' },
        ],
      },
      {
        id: 'ops',
        label: 'Operations',
        children: [
          { id: 'ops-registry', label: 'Nurse aide registry' },
          { id: 'ops-pa', label: 'Prior authorization' },
        ],
      },
      { id: 'fin', label: 'Finance' },
    ],
  },
];

export const SAMPLE_OPTIONS = [
  { value: 'react', label: 'React', description: 'Web UI library' },
  { value: 'react-native', label: 'React Native', description: 'Native mobile UI' },
  { value: 'redux', label: 'Redux Toolkit', description: 'State + RTK Query' },
  { value: 'inversify', label: 'InversifyJS', description: 'Inversion of control' },
  { value: 'zod', label: 'Zod', description: 'Schema validation' },
  { value: 'i18next', label: 'i18next', description: 'Localization' },
  { value: 'dynatrace', label: 'Dynatrace', description: 'Observability', disabled: true },
];

export const SAMPLE_TIMELINE = [
  { id: 't1', title: 'Order submitted', description: 'SO-24012 created by Maya Chen', at: '09:12', tone: 'primary' as const },
  { id: 't2', title: 'Credit check passed', description: 'Automated rule engine', at: '09:13', tone: 'success' as const },
  { id: 't3', title: 'Awaiting approval', description: 'Total exceeds $25,000', at: '09:14', tone: 'warning' as const },
  { id: 't4', title: 'Shipment scheduled', description: 'Carrier pickup tomorrow', at: '—', tone: 'neutral' as const },
];
