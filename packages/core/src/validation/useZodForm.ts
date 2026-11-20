import { useForm, type FieldValues, type Resolver, type UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';

/**
 * Client-side validation primitive shared by web and mobile:
 * React Hook Form wired to a zod schema (messages are i18n keys, see vmsg()).
 */
export function useZodForm<TSchema extends z.ZodType<FieldValues, z.ZodTypeDef, FieldValues>>(
  schema: TSchema,
  options?: Omit<UseFormProps<z.input<TSchema>, unknown, z.output<TSchema>>, 'resolver'>,
) {
  return useForm<z.input<TSchema>, unknown, z.output<TSchema>>({
    mode: 'onTouched',
    reValidateMode: 'onChange',
    ...options,
    // zodResolver's overloads cannot be inferred through a generic schema parameter.
    resolver: zodResolver(schema as never) as unknown as Resolver<z.input<TSchema>, unknown, z.output<TSchema>>,
  });
}
