import { z } from 'zod';

/**
 * Схема валидации для регистрации
 */
export const registerSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(5, 'Email must be at least 5 characters')
    .max(100, 'Email must not exceed 100 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters'),
  fullName: z
    .string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters')
    .optional(),
  phone: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, 'Invalid phone number format')
    .optional(),
});

/**
 * Схема валидации для логина
 */
export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .min(5, 'Email must be at least 5 characters'),
  password: z
    .string()
    .min(1, 'Password is required'),
});

/**
 * Схема валидации для refresh токена
 * Примечание: Токен берется из httpOnly cookie, а не из body
 */
export const refreshSchema = z.object({
  // Пустая схема, так как токен берется из cookie
});
