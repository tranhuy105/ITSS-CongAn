import { z } from 'zod';

export const createUserClientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['guest', 'admin']).default('guest'),
  isLocked: z.boolean().default(false),
});

export type CreateUserClientPayload = z.infer<typeof createUserClientSchema>;

export const updateUserClientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .optional()
    .refine((v) => !v || v.length >= 6, 'Password must be at least 6 characters'),
  role: z.enum(['guest', 'admin']).default('guest'),
  isLocked: z.boolean().default(false),
});

export type UpdateUserClientPayload = z.infer<typeof updateUserClientSchema>;


