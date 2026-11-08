import { z } from 'zod'
import { scorePassword } from '../components/ui/TextFields.jsx'

/**
 * Shared Zod email schema used across Login, Signup, and Forgot Password
 */
export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Please enter your email address')
  .email('Please enter a valid email address (e.g. name@example.com)')

/**
 * Validates an email string against the shared schema
 * Returns an error message string or null if valid.
 */
export function validateEmail(email: string): string | null {
  const result = emailSchema.safeParse(email)
  if (!result.success) {
    return result.error.issues[0]?.message || 'Please enter a valid email address'
  }
  return null
}

/**
 * Zod schema for password validation:
 * Submit button stays disabled below "Good" (score >= 3)
 */
export const passwordStrengthSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters long')
  .refine((val) => scorePassword(val) >= 3, {
    message: 'Password must be at least "Good" strength (mix of letters, numbers, and symbols)',
  })

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Please enter your password'),
})

export const signupSchema = z
  .object({
    name: z.string().trim().min(2, 'Please enter your full name'),
    email: emailSchema,
    password: passwordStrengthSchema,
    confirmPassword: z.string(),
    agreeTerms: z.literal(true, {
      message: 'Please accept the Terms and Privacy Policy to continue',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export const resetPasswordSchema = z
  .object({
    password: passwordStrengthSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
