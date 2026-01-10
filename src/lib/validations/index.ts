import { z } from 'zod';

// ============================================
// Password Validation Schema (Reusable)
// ============================================
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character');

// Simple password for login (no strength requirements)
export const loginPasswordSchema = z
  .string()
  .min(1, 'Password is required')
  .max(128, 'Password is too long');

// ============================================
// Email Validation Schema
// ============================================
export const emailSchema = z
  .string()
  .min(1, 'Email is required')
  .email('Please enter a valid email address')
  .max(254, 'Email is too long')
  .toLowerCase()
  .refine(
    (email) => !email.endsWith('.con'),
    'Did you mean .com?'
  );

// ============================================
// Name Validation Schema
// ============================================
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes');

// ============================================
// OTP Validation Schema
// ============================================
export const otpSchema = z
  .string()
  .length(6, 'OTP must be exactly 6 digits')
  .regex(/^\d{6}$/, 'OTP must contain only numbers');

// ============================================
// Login Form Schema
// ============================================
export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
  totpCode: z.string().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// ============================================
// Registration Form Schema
// ============================================
export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export type RegisterFormData = z.infer<typeof registerSchema>;

// ============================================
// OTP Verification Schema
// ============================================
export const otpVerificationSchema = z.object({
  otp: otpSchema,
});

export type OTPVerificationData = z.infer<typeof otpVerificationSchema>;

// ============================================
// Forgot Password Schema
// ============================================
export const forgotPasswordEmailSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordEmailData = z.infer<typeof forgotPasswordEmailSchema>;

// ============================================
// Reset Password Schema
// ============================================
export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;

// ============================================
// Profile Update Schema
// ============================================
export const profileUpdateSchema = z.object({
  name: nameSchema.optional().or(z.literal('')),
  company: z
    .string()
    .max(100, 'Company name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
});

export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

// ============================================
// Change Password Schema
// ============================================
export const changePasswordSchema = z.object({
  otp: otpSchema,
  newPassword: passwordSchema,
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type ChangePasswordData = z.infer<typeof changePasswordSchema>;

// ============================================
// API Key Schema
// ============================================
export const apiKeySchema = z.object({
  name: z
    .string()
    .min(1, 'API key name is required')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z0-9\s_-]+$/, 'Name can only contain letters, numbers, spaces, underscores, and hyphens'),
});

export type APIKeyData = z.infer<typeof apiKeySchema>;

// ============================================
// Webhook Schema
// ============================================
export const webhookSchema = z.object({
  name: z
    .string()
    .max(50, 'Name must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  url: z
    .string()
    .min(1, 'Webhook URL is required')
    .url('Please enter a valid URL')
    .refine(
      (url) => url.startsWith('https://'),
      'Webhook URL must use HTTPS for security'
    ),
  events: z
    .array(z.string())
    .min(1, 'Please select at least one event'),
});

export type WebhookData = z.infer<typeof webhookSchema>;

// ============================================
// Email Validation Input Schema
// ============================================
export const emailValidationSchema = z.object({
  email: emailSchema,
  mode: z.enum(['fast', 'deep']).default('fast'),
});

export type EmailValidationData = z.infer<typeof emailValidationSchema>;

// ============================================
// Email Finder Schema
// ============================================
export const emailFinderSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name is too long'),
  domain: z
    .string()
    .min(1, 'Domain is required')
    .regex(
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?\.[a-zA-Z]{2,}$/,
      'Please enter a valid domain (e.g., example.com)'
    ),
});

export type EmailFinderData = z.infer<typeof emailFinderSchema>;

// ============================================
// 2FA Code Schema
// ============================================
export const twoFactorCodeSchema = z.object({
  code: z
    .string()
    .length(6, 'Code must be exactly 6 digits')
    .regex(/^\d{6}$/, 'Code must contain only numbers'),
});

export type TwoFactorCodeData = z.infer<typeof twoFactorCodeSchema>;

// ============================================
// Delete Account Schema
// ============================================
export const deleteAccountSchema = z.object({
  password: z.string().min(1, 'Password is required to delete your account'),
  confirmation: z
    .string()
    .refine((val) => val === 'DELETE', 'Please type DELETE to confirm'),
});

export type DeleteAccountData = z.infer<typeof deleteAccountSchema>;

// ============================================
// Password Strength Calculator
// ============================================
export interface PasswordStrength {
  score: number; // 0-4
  label: 'Very Weak' | 'Weak' | 'Fair' | 'Strong' | 'Very Strong';
  color: string;
  suggestions: string[];
}

export function calculatePasswordStrength(password: string): PasswordStrength {
  let score = 0;
  const suggestions: string[] = [];

  if (!password) {
    return {
      score: 0,
      label: 'Very Weak',
      color: 'bg-red-500',
      suggestions: ['Enter a password'],
    };
  }

  // Length checks
  if (password.length >= 8) score++;
  else suggestions.push('Use at least 8 characters');

  if (password.length >= 12) score++;
  if (password.length >= 16) score++;

  // Character type checks
  if (/[A-Z]/.test(password)) score++;
  else suggestions.push('Add uppercase letters');

  if (/[a-z]/.test(password)) score++;
  else suggestions.push('Add lowercase letters');

  if (/[0-9]/.test(password)) score++;
  else suggestions.push('Add numbers');

  if (/[^A-Za-z0-9]/.test(password)) score++;
  else suggestions.push('Add special characters (!@#$%^&*)');

  // Penalize common patterns
  if (/^[a-zA-Z]+$/.test(password)) score--;
  if (/^[0-9]+$/.test(password)) score--;
  if (/(.)\1{2,}/.test(password)) {
    score--;
    suggestions.push('Avoid repeated characters');
  }
  if (/^(password|123456|qwerty)/i.test(password)) {
    score = 0;
    suggestions.push('Avoid common passwords');
  }

  // Normalize score to 0-4
  const normalizedScore = Math.max(0, Math.min(4, Math.floor(score / 2)));

  const labels: PasswordStrength['label'][] = [
    'Very Weak',
    'Weak',
    'Fair',
    'Strong',
    'Very Strong',
  ];

  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
  ];

  return {
    score: normalizedScore,
    label: labels[normalizedScore],
    color: colors[normalizedScore],
    suggestions: suggestions.slice(0, 3), // Max 3 suggestions
  };
}

// ============================================
// Validation Error Helper
// ============================================
export function getFieldError(
  errors: Record<string, { message?: string }>,
  field: string
): string | undefined {
  return errors[field]?.message;
}
