import { z } from 'zod';
import { vmsg } from './messages';

const required = vmsg('validation.required');

export const emailSchema = z.string().trim().min(1, required).email(vmsg('validation.email'));

export const passwordSchema = z
  .string()
  .min(8, vmsg('validation.minLength', { count: 8 }))
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, vmsg('validation.passwordStrength'));

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9 ()-]{7,20}$/, vmsg('validation.phone'));

export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, required);

function ageInYears(iso: string): number {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  return diff / (365.25 * 86_400_000);
}

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, required),
  rememberMe: z.boolean(),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const PLANS = ['basic', 'pro', 'enterprise'] as const;
export const COUNTRIES = [
  { value: 'us', label: 'United States' },
  { value: 'in', label: 'India' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
  { value: 'es', label: 'Spain' },
  { value: 'fr', label: 'France' },
  { value: 'de', label: 'Germany' },
  { value: 'jp', label: 'Japan' },
];
export const SKILLS = ['React', 'React Native', 'TypeScript', '.NET', 'Azure', 'SQL', 'DevOps', 'UX'];

export const registrationSchema = z
  .object({
    firstName: z.string().trim().min(2, vmsg('validation.minLength', { count: 2 })).max(50, vmsg('validation.maxLength', { count: 50 })),
    lastName: z.string().trim().min(2, vmsg('validation.minLength', { count: 2 })).max(50, vmsg('validation.maxLength', { count: 50 })),
    email: emailSchema,
    phone: phoneSchema.or(z.literal('')),
    password: passwordSchema,
    confirmPassword: z.string().min(1, required),
    birthDate: isoDateSchema.refine((v) => ageInYears(v) >= 18, vmsg('validation.dateAdult')),
    country: z.string().min(1, required),
    plan: z.enum(PLANS, { errorMap: () => ({ message: required }) }),
    experience: z
      .number({ invalid_type_error: required })
      .int(vmsg('validation.integer'))
      .min(0, vmsg('validation.min', { min: 0 }))
      .max(50, vmsg('validation.max', { max: 50 })),
    skills: z.array(z.string()).min(1, vmsg('validation.selectAtLeast', { count: 1 })),
    bio: z.string().max(280, vmsg('validation.maxLength', { count: 280 })),
    newsletter: z.boolean(),
    acceptTerms: z.boolean().refine((v) => v, vmsg('validation.acceptTerms')),
  })
  .superRefine((values, ctx) => {
    if (values.password !== values.confirmPassword) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['confirmPassword'], message: vmsg('validation.passwordsMatch') });
    }
  });
export type RegistrationFormValues = z.infer<typeof registrationSchema>;

export const registrationDefaults: RegistrationFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  birthDate: '',
  country: '',
  plan: 'pro',
  experience: 3,
  skills: [],
  bio: '',
  newsletter: true,
  acceptTerms: false,
};

export const orderLineSchema = z.object({
  productId: z.string().min(1, required),
  quantity: z
    .number({ invalid_type_error: required })
    .int(vmsg('validation.integer'))
    .min(1, vmsg('validation.min', { min: 1 }))
    .max(999, vmsg('validation.max', { max: 999 })),
});

export const orderSchema = z.object({
  customer: z.string().trim().min(2, vmsg('validation.minLength', { count: 2 })),
  priority: z.enum(['low', 'normal', 'high']),
  requestedDate: isoDateSchema.refine((v) => new Date(v).getTime() > Date.now() - 86_400_000, vmsg('validation.dateFuture')),
  discountPct: z.number().min(0, vmsg('validation.min', { min: 0 })).max(50, vmsg('validation.max', { max: 50 })),
  notes: z.string().max(500, vmsg('validation.maxLength', { count: 500 })),
  lines: z.array(orderLineSchema).min(1, vmsg('validation.atLeastOneLine')),
});
export type OrderFormValues = z.infer<typeof orderSchema>;
