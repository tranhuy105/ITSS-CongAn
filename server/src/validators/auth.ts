import { z } from 'zod';

// Email validation
const emailSchema = z
  .string()
  .email('Invalid email format')
  .min(1, 'Email is required');

// Password validation - must contain at least 2 of: letters, numbers, symbols (excluding " and ')
const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters long')
  .refine((password) => {
    let criteriaCount = 0;
    if (/[a-zA-Z]/.test(password)) criteriaCount++;
    if (/\d/.test(password)) criteriaCount++;
    if (/[!@#$%^&*()_+\-=\[\]{};:,.<>?/\\|`~]/.test(password)) criteriaCount++;
    return criteriaCount >= 2;
  }, 'Password must contain at least 2 of: letters, numbers, symbols (excluding " and \')');

// Register validation schema
export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters long')
    .max(100, 'Name cannot exceed 100 characters')
    .trim(),
  email: emailSchema,
  password: passwordSchema,
});

// Login validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Refresh token validation schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Password reset request schema
export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

// Password reset confirmation schema
export const passwordResetSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type PasswordResetRequestInput = z.infer<typeof passwordResetRequestSchema>;
export type PasswordResetInput = z.infer<typeof passwordResetSchema>;
