import { FLAGS } from '../featureFlags/definitions';
import type { FormSchema } from './types';

/** Example schemas (would normally be served by a forms/configuration API). */
export const customerOnboardingSchema: FormSchema = {
  id: 'customer-onboarding',
  title: 'Customer onboarding',
  description: 'Captures a new enterprise customer. Conditional fields appear based on answers.',
  submitLabel: 'Create customer',
  sections: [
    {
      id: 'company',
      title: 'Company',
      fields: [
        { name: 'companyName', type: 'text', label: 'Company name', required: true, minLength: 2, width: 'half' },
        { name: 'contactEmail', type: 'email', label: 'Billing email', required: true, width: 'half' },
        {
          name: 'industry',
          type: 'select',
          label: 'Industry',
          required: true,
          width: 'half',
          options: [
            { value: 'healthcare', label: 'Healthcare' },
            { value: 'energy', label: 'Energy & utilities' },
            { value: 'mortgage', label: 'Mortgage & lending' },
            { value: 'manufacturing', label: 'Industrial / manufacturing' },
          ],
        },
        { name: 'employees', type: 'number', label: 'Employees', required: true, min: 1, max: 500000, width: 'half' },
        {
          name: 'hipaa',
          type: 'switch',
          label: 'Requires HIPAA BAA',
          visibleWhen: { field: 'industry', equals: 'healthcare' },
        },
      ],
    },
    {
      id: 'plan',
      title: 'Subscription',
      fields: [
        {
          name: 'tier',
          type: 'radio',
          label: 'Tier',
          required: true,
          defaultValue: 'standard',
          options: [
            { value: 'standard', label: 'Standard' },
            { value: 'premium', label: 'Premium' },
            { value: 'custom', label: 'Custom contract' },
          ],
        },
        {
          name: 'contractNotes',
          type: 'textarea',
          label: 'Contract requirements',
          required: true,
          minLength: 20,
          maxLength: 500,
          visibleWhen: { field: 'tier', equals: 'custom' },
        },
        { name: 'seats', type: 'slider', label: 'Licensed seats', min: 5, max: 500, step: 5, defaultValue: 50 },
        { name: 'goLive', type: 'date', label: 'Target go-live', required: true, width: 'half' },
        {
          name: 'modules',
          type: 'multiselect',
          label: 'Modules',
          min: 1,
          required: true,
          options: [
            { value: 'billing', label: 'Billing' },
            { value: 'portal', label: 'Self-service portal' },
            { value: 'analytics', label: 'Analytics' },
            { value: 'integrations', label: 'Integrations' },
          ],
        },
        {
          name: 'aiAssist',
          type: 'checkbox',
          label: 'Enable AI assist (experimental)',
          featureFlag: FLAGS.aiAssist,
        },
        { name: 'terms', type: 'checkbox', label: 'Customer accepted the MSA', required: true },
      ],
    },
  ],
};

export const incidentReportSchema: FormSchema = {
  id: 'incident-report',
  title: 'Incident report',
  description: 'Operational incident intake with permission-gated fields.',
  submitLabel: 'Submit incident',
  sections: [
    {
      id: 'incident',
      title: 'Incident',
      fields: [
        { name: 'summary', type: 'text', label: 'Summary', required: true, minLength: 10, maxLength: 120 },
        {
          name: 'service',
          type: 'combobox',
          label: 'Affected service',
          required: true,
          width: 'half',
          options: [
            { value: 'auth', label: 'Identity / SSO' },
            { value: 'orders', label: 'Orders API' },
            { value: 'payments', label: 'Payments' },
            { value: 'search', label: 'Search' },
            { value: 'notifications', label: 'Notifications' },
            { value: 'dr', label: 'DR failover (Front Door)' },
          ],
        },
        {
          name: 'severity',
          type: 'select',
          label: 'Severity',
          required: true,
          width: 'half',
          options: [
            { value: 'sev1', label: 'SEV1 – critical' },
            { value: 'sev2', label: 'SEV2 – major' },
            { value: 'sev3', label: 'SEV3 – minor' },
          ],
        },
        { name: 'impact', type: 'rating', label: 'Customer impact', min: 0, max: 5 },
        { name: 'details', type: 'textarea', label: 'What happened?', required: true, minLength: 20 },
        {
          name: 'postmortemOwner',
          type: 'email',
          label: 'Post-mortem owner (managers only)',
          permission: 'orders:approve',
        },
        { name: 'notifyStakeholders', type: 'switch', label: 'Notify stakeholders', defaultValue: true },
      ],
    },
  ],
};

export const SAMPLE_FORM_SCHEMAS: FormSchema[] = [customerOnboardingSchema, incidentReportSchema];
