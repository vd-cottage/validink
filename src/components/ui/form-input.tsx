'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react';

// ============================================
// Form Input Props Interface
// ============================================
export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  success?: string;
  showPasswordToggle?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  inputContainerClassName?: string;
}

// ============================================
// Form Input Component
// ============================================
const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      hint,
      success,
      showPasswordToggle,
      isLoading,
      leftIcon,
      rightIcon,
      containerClassName,
      labelClassName,
      inputContainerClassName,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const generatedId = React.useId();
    const inputId = id || generatedId;

    const inputType = type === 'password' && showPassword ? 'text' : type;
    const hasError = Boolean(error);
    const hasSuccess = Boolean(success);
    const isPasswordField = type === 'password';

    return (
      <div className={cn('space-y-2', containerClassName)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-sm font-medium transition-colors duration-200',
              hasError
                ? 'text-red-600 dark:text-red-400'
                : hasSuccess
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-700 dark:text-gray-300',
              labelClassName
            )}
          >
            {label}
            {props.required && (
              <span className="ml-1 text-red-500" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        {/* Input Container */}
        <div className={cn('relative', inputContainerClassName)}>
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
              {leftIcon}
            </div>
          )}

          {/* Input Field */}
          <input
            id={inputId}
            type={inputType}
            disabled={disabled || isLoading}
            ref={ref}
            className={cn(
              // Base styles
              'flex h-11 w-full rounded-lg border bg-white dark:bg-gray-900/50 px-4 py-2 text-sm',
              'transition-all duration-200 ease-in-out',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium',

              // Focus styles with ring
              'focus:outline-none focus:ring-2 focus:ring-offset-0',

              // State-based styles
              hasError
                ? 'border-red-300 dark:border-red-500/50 focus:border-red-500 focus:ring-red-500/20 dark:focus:ring-red-500/30'
                : hasSuccess
                ? 'border-green-300 dark:border-green-500/50 focus:border-green-500 focus:ring-green-500/20 dark:focus:ring-green-500/30'
                : 'border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-primary/20 dark:focus:ring-primary/30',

              // Disabled styles
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50 dark:disabled:bg-gray-800/50',

              // Icon padding
              leftIcon && 'pl-10',
              (rightIcon || isPasswordField || isLoading) && 'pr-10',

              // Text color
              'text-gray-900 dark:text-gray-100',

              className
            )}
            aria-invalid={hasError ? 'true' : undefined}
            aria-describedby={
              hasError
                ? `${inputId}-error`
                : hint
                ? `${inputId}-hint`
                : undefined
            }
            {...props}
          />

          {/* Right Side Icons Container */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {/* Loading Spinner */}
            {isLoading && (
              <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
            )}

            {/* Status Icon */}
            {!isLoading && hasError && !isPasswordField && (
              <AlertCircle className="h-4 w-4 text-red-500" />
            )}
            {!isLoading && hasSuccess && !isPasswordField && (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}

            {/* Password Toggle */}
            {isPasswordField && showPasswordToggle !== false && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={cn(
                  'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
                  'focus:outline-none focus:text-primary',
                  'transition-colors duration-200',
                  'p-0.5 rounded'
                )}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            )}

            {/* Custom Right Icon */}
            {rightIcon && !isPasswordField && !isLoading && (
              <div className="text-gray-400 dark:text-gray-500">
                {rightIcon}
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {hasError && (
          <div
            id={`${inputId}-error`}
            role="alert"
            className={cn(
              'flex items-start gap-2 text-sm text-red-600 dark:text-red-400',
              'animate-in slide-in-from-top-1 fade-in duration-200'
            )}
          >
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {hasSuccess && !hasError && (
          <div
            className={cn(
              'flex items-start gap-2 text-sm text-green-600 dark:text-green-400',
              'animate-in slide-in-from-top-1 fade-in duration-200'
            )}
          >
            <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Hint Message */}
        {hint && !hasError && !hasSuccess && (
          <div
            id={`${inputId}-hint`}
            className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400"
          >
            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <span>{hint}</span>
          </div>
        )}
      </div>
    );
  }
);

FormInput.displayName = 'FormInput';

// ============================================
// Password Strength Indicator Component
// ============================================
interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export function PasswordStrengthIndicator({
  password,
  className,
}: PasswordStrengthIndicatorProps) {
  const strength = React.useMemo(() => {
    if (!password) {
      return { score: 0, label: 'Very Weak', color: 'bg-gray-200 dark:bg-gray-700', suggestions: [] as string[] };
    }

    let score = 0;
    const suggestions: string[] = [];

    // Length checks
    if (password.length >= 8) score++;
    else suggestions.push('Use at least 8 characters');

    if (password.length >= 12) score++;

    // Character type checks
    if (/[A-Z]/.test(password)) score++;
    else suggestions.push('Add uppercase letters');

    if (/[a-z]/.test(password)) score++;
    else suggestions.push('Add lowercase letters');

    if (/[0-9]/.test(password)) score++;
    else suggestions.push('Add numbers');

    if (/[^A-Za-z0-9]/.test(password)) score++;
    else suggestions.push('Add special characters');

    // Normalize to 0-4
    const normalizedScore = Math.min(4, Math.floor((score / 6) * 4));

    const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
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
      suggestions: suggestions.slice(0, 2),
    };
  }, [password]);

  if (!password) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {/* Strength Bars */}
      <div className="flex gap-1">
        {[0, 1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-all duration-300',
              index <= strength.score
                ? strength.color
                : 'bg-gray-200 dark:bg-gray-700'
            )}
          />
        ))}
      </div>

      {/* Label and Suggestions */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'text-xs font-medium',
            strength.score <= 1
              ? 'text-red-600 dark:text-red-400'
              : strength.score <= 2
              ? 'text-yellow-600 dark:text-yellow-400'
              : 'text-green-600 dark:text-green-400'
          )}
        >
          {strength.label}
        </span>
        {strength.suggestions.length > 0 && (
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {strength.suggestions[0]}
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================
// OTP Input Component
// ============================================
interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export function OTPInput({
  length = 6,
  value,
  onChange,
  error,
  disabled,
  autoFocus,
  className,
}: OTPInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);
  const hasError = Boolean(error);

  const handleChange = (index: number, char: string) => {
    if (!/^\d*$/.test(char)) return; // Only allow digits

    const newValue = value.split('');
    newValue[index] = char;
    const result = newValue.join('').slice(0, length);
    onChange(result);

    // Move to next input
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    onChange(pastedData);

    // Focus last filled or next empty input
    const focusIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-center gap-2 sm:gap-3">
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => { inputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onPaste={handlePaste}
            disabled={disabled}
            autoFocus={autoFocus && index === 0}
            className={cn(
              'w-10 h-12 sm:w-12 sm:h-14 text-center text-xl sm:text-2xl font-semibold rounded-lg border',
              'transition-all duration-200 ease-in-out',
              'focus:outline-none focus:ring-2 focus:ring-offset-0',
              'bg-white dark:bg-gray-900/50 text-gray-900 dark:text-gray-100',
              hasError
                ? 'border-red-300 dark:border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-primary/20',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            aria-label={`Digit ${index + 1}`}
          />
        ))}
      </div>

      {hasError && (
        <div
          role="alert"
          className={cn(
            'flex items-center justify-center gap-2 text-sm text-red-600 dark:text-red-400',
            'animate-in slide-in-from-top-1 fade-in duration-200'
          )}
        >
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

// ============================================
// Form Section Component (for organizing forms)
// ============================================
interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  children,
  className,
}: FormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// ============================================
// Form Error Summary Component
// ============================================
interface FormErrorSummaryProps {
  errors: Record<string, { message?: string }>;
  className?: string;
}

export function FormErrorSummary({ errors, className }: FormErrorSummaryProps) {
  const errorMessages = Object.entries(errors)
    .filter(([_, error]) => error?.message)
    .map(([field, error]) => ({ field, message: error.message! }));

  if (errorMessages.length === 0) return null;

  return (
    <div
      role="alert"
      className={cn(
        'rounded-lg border border-red-200 dark:border-red-500/30 bg-red-50 dark:bg-red-500/10 p-4',
        'animate-in slide-in-from-top-2 fade-in duration-300',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="text-sm font-medium text-red-800 dark:text-red-200">
            Please fix the following errors:
          </p>
          <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-300 space-y-0.5">
            {errorMessages.map(({ field, message }) => (
              <li key={field}>{message}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export { FormInput };
export default FormInput;
