'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { FormInput, OTPInput, PasswordStrengthIndicator } from '@/components/ui/form-input';
import Link from 'next/link';
import { Loader2, ArrowLeft, Mail, Lock, CheckCircle2, ShieldCheck, KeyRound, Sparkles, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/lib/services/api';
import { Navbar } from '@/components/marketing/navbar';
import {
  forgotPasswordEmailSchema,
  resetPasswordSchema,
  type ForgotPasswordEmailData,
  type ResetPasswordData
} from '@/lib/validations';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Email form setup
  const emailForm = useForm<ForgotPasswordEmailData>({
    resolver: zodResolver(forgotPasswordEmailSchema),
    mode: 'onBlur',
    defaultValues: { email: '' },
  });

  // Password reset form setup
  const passwordForm = useForm<ResetPasswordData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
    defaultValues: { password: '', confirmPassword: '' },
  });

  const watchedPassword = passwordForm.watch('password');

  // Timer effect for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Auto-focus email on mount
  useEffect(() => {
    if (step === 1) {
      emailForm.setFocus('email');
    }
  }, [emailForm, step]);

  // Step 1: Request OTP
  async function onRequestOtp(data: ForgotPasswordEmailData) {
    setIsLoading(true);
    setServerError('');
    setEmail(data.email);

    try {
      await apiService.auth.forgotPassword(data.email);
      toast.success('Verification code sent!', {
        description: 'Please check your email inbox.'
      });
      setStep(2);
      setResendCooldown(30);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to send verification code';
      setServerError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  // Resend OTP
  async function handleResendOtp() {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    setServerError('');

    try {
      await apiService.auth.forgotPassword(email);
      toast.success('Verification code resent!');
      setResendCooldown(30);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to resend code';
      setServerError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  // Step 2: Verify OTP
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();

    if (otpCode.length !== 6) {
      setServerError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    setServerError('');

    try {
      const res = await apiService.auth.verifyForgotOtp(email, otpCode);
      setResetToken(res.data.data.resetToken);
      toast.success('Code verified!');
      setStep(3);
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Invalid verification code';
      setServerError(errorMessage);
      setOtpCode('');
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  // Step 3: Reset Password
  async function onResetPassword(data: ResetPasswordData) {
    setIsLoading(true);
    setServerError('');

    try {
      await apiService.auth.resetPassword({ token: resetToken, password: data.password });
      toast.success('Password reset successfully!', {
        description: 'You can now sign in with your new password.'
      });
      router.push('/login');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to reset password';
      setServerError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  // Step indicators
  const steps = [
    { number: 1, label: 'Email' },
    { number: 2, label: 'Verify' },
    { number: 3, label: 'Reset' },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />
      <div className="flex-1 w-full lg:grid lg:grid-cols-2">
        {/* Form Side */}
        <div className="flex items-center justify-center py-8 sm:py-12 px-4 min-h-[calc(100vh-4rem)] lg:min-h-0">
          <div className="w-full max-w-[400px] space-y-8">
            {/* Header */}
            <div className="flex flex-col space-y-2 text-center">
              <div className="mx-auto mb-2 p-3 rounded-2xl bg-primary/10 dark:bg-primary/20 w-fit">
                {step === 1 && <Mail className="h-8 w-8 text-primary" />}
                {step === 2 && <KeyRound className="h-8 w-8 text-primary" />}
                {step === 3 && <Lock className="h-8 w-8 text-primary" />}
              </div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                {step === 1 && 'Reset Password'}
                {step === 2 && 'Verify Your Email'}
                {step === 3 && 'Create New Password'}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                {step === 1 && 'Enter your email to receive a verification code'}
                {step === 2 && `Enter the 6-digit code sent to ${email}`}
                {step === 3 && 'Choose a strong password for your account'}
              </p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2">
              {steps.map((s, index) => (
                <div key={s.number} className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-300 ${
                      step >= s.number
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
                    }`}
                  >
                    {step > s.number ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      s.number
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-12 h-0.5 mx-2 transition-all duration-300 ${
                        step > s.number ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Server Error */}
            {serverError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 p-4 animate-in slide-in-from-top-2 fade-in duration-300">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 p-1 rounded-full bg-red-100 dark:bg-red-500/20">
                    <ShieldCheck className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                    {serverError}
                  </p>
                </div>
              </div>
            )}

            {/* Step 1: Email Form */}
            {step === 1 && (
              <form onSubmit={emailForm.handleSubmit(onRequestOtp)} className="space-y-5">
                <FormInput
                  label="Email address"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={emailForm.formState.errors.email?.message}
                  success={
                    emailForm.formState.touchedFields.email &&
                    !emailForm.formState.errors.email &&
                    emailForm.watch('email')
                      ? 'Valid email'
                      : undefined
                  }
                  disabled={isLoading}
                  {...emailForm.register('email')}
                />

                <Button
                  className="w-full h-11 text-base font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending Code...
                    </>
                  ) : (
                    <>
                      Send Verification Code
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <form onSubmit={handleVerifyOtp} className="space-y-6">
                <div className="space-y-4">
                  <OTPInput
                    length={6}
                    value={otpCode}
                    onChange={setOtpCode}
                    disabled={isLoading}
                    autoFocus
                  />
                  <p className="text-center text-xs text-muted-foreground">
                    Check your email inbox for the verification code
                  </p>
                </div>

                <Button
                  className="w-full h-11 text-base font-medium shadow-lg shadow-primary/25"
                  type="submit"
                  disabled={isLoading || otpCode.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Code
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isLoading || resendCooldown > 0}
                  >
                    {resendCooldown > 0 ? (
                      <span className="tabular-nums">Resend in {resendCooldown}s</span>
                    ) : (
                      'Resend Code'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    onClick={() => {
                      setStep(1);
                      setOtpCode('');
                      setServerError('');
                    }}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Change Email
                  </Button>
                </div>
              </form>
            )}

            {/* Step 3: New Password Form */}
            {step === 3 && (
              <form onSubmit={passwordForm.handleSubmit(onResetPassword)} className="space-y-5">
                <div className="space-y-2">
                  <FormInput
                    label="New Password"
                    type="password"
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    leftIcon={<Lock className="h-4 w-4" />}
                    error={passwordForm.formState.errors.password?.message}
                    disabled={isLoading}
                    {...passwordForm.register('password')}
                  />
                  <PasswordStrengthIndicator password={watchedPassword} />
                </div>

                <FormInput
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  leftIcon={<CheckCircle2 className="h-4 w-4" />}
                  error={passwordForm.formState.errors.confirmPassword?.message}
                  success={
                    passwordForm.formState.touchedFields.confirmPassword &&
                    !passwordForm.formState.errors.confirmPassword &&
                    passwordForm.watch('confirmPassword') &&
                    passwordForm.watch('password') === passwordForm.watch('confirmPassword')
                      ? 'Passwords match'
                      : undefined
                  }
                  disabled={isLoading}
                  {...passwordForm.register('confirmPassword')}
                />

                <Button
                  className="w-full h-11 text-base font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resetting Password...
                    </>
                  ) : (
                    <>
                      Reset Password
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200 dark:border-gray-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-3 text-muted-foreground">
                  Remember your password?
                </span>
              </div>
            </div>

            {/* Back to Login Link */}
            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Visual Side */}
        <div className="hidden bg-gradient-to-br from-primary/5 via-purple-500/5 to-primary/10 dark:from-primary/10 dark:via-purple-500/5 dark:to-primary/5 lg:flex relative overflow-hidden items-center justify-center">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-full h-full" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
              backgroundSize: '40px 40px',
            }} />
          </div>

          {/* Content */}
          <div className="relative z-10 w-full max-w-lg p-8">
            <div className="space-y-6">
              {/* Main Card */}
              <div className="p-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-primary to-purple-600 text-white">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    Secure Recovery
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Recover access to your account quickly and securely. We use industry-standard encryption to keep your data safe.
                </p>
              </div>

              {/* Security Features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className="h-5 w-5 text-primary" />
                    <span className="font-medium">Encrypted</span>
                  </div>
                  <p className="text-sm text-muted-foreground">256-bit SSL encryption</p>
                </div>
                <div className="p-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <span className="font-medium">Verified</span>
                  </div>
                  <p className="text-sm text-muted-foreground">2-step verification</p>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>
      </div>
    </div>
  );
}
