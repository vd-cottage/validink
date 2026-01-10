'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { FormInput, OTPInput, PasswordStrengthIndicator } from '@/components/ui/form-input';
import Link from 'next/link';
import { Mail, User, Lock, ArrowRight, Loader2, Sparkles, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { apiService } from '@/lib/services/api';
import { Navbar } from '@/components/marketing/navbar';
import { toast } from 'sonner';
import { registerSchema, type RegisterFormData } from '@/lib/validations';

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [step, setStep] = useState<'initiate' | 'verify'>('initiate');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [storedPassword, setStoredPassword] = useState('');

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    watch,
    setFocus,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const watchedName = watch('name');
  const watchedEmail = watch('email');
  const watchedPassword = watch('password');

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  // Timer effect for resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Auto-focus name on mount
  useEffect(() => {
    if (step === 'initiate') {
      setFocus('name');
    }
  }, [setFocus, step]);

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="text-center">
          <div className="relative">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary/30 border-t-primary mx-auto"></div>
            <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
          </div>
          <p className="mt-4 text-sm text-muted-foreground animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render register page for authenticated users
  if (status === 'authenticated') {
    return null;
  }

  async function handleResend() {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    setServerError('');

    try {
      const response = await apiService.auth.initiateRegister({
        email,
        password: storedPassword,
        name: watchedName
      });

      setResendCooldown(30);
      toast.success('Verification code sent!', {
        description: 'Please check your email inbox.'
      });

      // Auto-fill logic for testing
      if (response.data.data?.otp) {
        console.log('TESTING OTP (RESEND):', response.data.data.otp);
        setOtpCode(response.data.data.otp);
      }

    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to resend code.';
      setServerError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(data: RegisterFormData) {
    setIsLoading(true);
    setServerError('');

    setEmail(data.email);
    setStoredPassword(data.password);

    try {
      const response = await apiService.auth.initiateRegister({
        email: data.email,
        password: data.password,
        name: data.name
      });

      setStep('verify');
      setResendCooldown(30);
      toast.success('Verification code sent!', {
        description: 'Please check your email inbox.'
      });

      // FOR TESTING: Auto-fill OTP if present in response
      if (response.data.data?.otp) {
        console.log('TESTING OTP:', response.data.data.otp);
        setOtpCode(response.data.data.otp);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to send verification code.';
      setServerError(errorMessage);
      toast.error('Registration Failed', {
        description: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifySubmit(e: React.FormEvent) {
    e.preventDefault();

    if (otpCode.length !== 6) {
      setServerError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    setServerError('');

    try {
      await apiService.auth.verifyRegister({
        email,
        otp: otpCode
      });

      const result = await signIn('credentials', {
        email,
        password: storedPassword,
        redirect: false,
      });

      if (result?.error) {
        setServerError(result.error);
        return;
      }

      toast.success('Account created successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Invalid code. Please try again.';
      setServerError(errorMessage);
      setOtpCode('');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <Navbar />
      <div className="flex-1 w-full lg:grid lg:grid-cols-2">
        {/* Visual Side */}
        <div className="hidden bg-gradient-to-br from-primary/5 via-purple-500/5 to-primary/10 dark:from-primary/10 dark:via-purple-500/5 dark:to-primary/5 lg:flex relative overflow-hidden items-center justify-center order-2 lg:order-1">
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
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    Start for Free
                  </h2>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Join thousands of businesses ensuring their email communications reach real people.
                </p>
                <ul className="space-y-4">
                  {[
                    { text: '100 Free Validations / Month', icon: CheckCircle2 },
                    { text: 'Real-time Deep Verification', icon: CheckCircle2 },
                    { text: 'Bulk CSV Processing', icon: CheckCircle2 },
                    { text: 'Hunter-style Email Finder', icon: CheckCircle2 },
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                      <div className="flex-shrink-0 p-1 rounded-full bg-green-100 dark:bg-green-500/20">
                        <feature.icon className="h-4 w-4 text-green-600 dark:text-green-400" />
                      </div>
                      {feature.text}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Trust Badge */}
              <div className="p-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg rounded-xl border border-gray-200/50 dark:border-gray-700/50 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span>Your data is secure with 256-bit encryption</span>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        {/* Form Side */}
        <div className="flex items-center justify-center py-8 sm:py-12 px-4 min-h-[calc(100vh-4rem)] lg:min-h-0 order-1 lg:order-2">
          <div className="w-full max-w-[400px] space-y-8">
            {/* Header */}
            <div className="flex flex-col space-y-2 text-center">
              <div className="mx-auto mb-2 p-3 rounded-2xl bg-primary/10 dark:bg-primary/20 w-fit">
                {step === 'initiate' ? (
                  <User className="h-8 w-8 text-primary" />
                ) : (
                  <ShieldCheck className="h-8 w-8 text-primary" />
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                {step === 'initiate' ? 'Create an account' : 'Verify your email'}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                {step === 'initiate'
                  ? 'Enter your details to get started'
                  : `Enter the 6-digit code sent to ${email}`}
              </p>
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

            {step === 'initiate' ? (
              /* Registration Form */
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <FormInput
                  label="Full Name"
                  type="text"
                  placeholder="John Doe"
                  autoComplete="name"
                  leftIcon={<User className="h-4 w-4" />}
                  error={errors.name?.message}
                  success={touchedFields.name && !errors.name && watchedName ? 'Looks good!' : undefined}
                  disabled={isLoading}
                  {...register('name')}
                />

                <FormInput
                  label="Email address"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={errors.email?.message}
                  success={touchedFields.email && !errors.email && watchedEmail ? 'Valid email' : undefined}
                  disabled={isLoading}
                  {...register('email')}
                />

                <div className="space-y-2">
                  <FormInput
                    label="Password"
                    type="password"
                    placeholder="Create a strong password"
                    autoComplete="new-password"
                    leftIcon={<Lock className="h-4 w-4" />}
                    error={errors.password?.message}
                    disabled={isLoading}
                    {...register('password')}
                  />
                  <PasswordStrengthIndicator password={watchedPassword} />
                </div>

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
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  By creating an account, you agree to our{' '}
                  <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                </p>
              </form>
            ) : (
              /* OTP Verification Form */
              <form onSubmit={handleVerifySubmit} className="space-y-6">
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
                      Complete Registration
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    type="button"
                    onClick={handleResend}
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
                      setStep('initiate');
                      setOtpCode('');
                      setServerError('');
                    }}
                    disabled={isLoading}
                  >
                    <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                    Back
                  </Button>
                </div>
              </form>
            )}

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200 dark:border-gray-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 px-3 text-muted-foreground">
                  Already have an account?
                </span>
              </div>
            </div>

            {/* Sign In Link */}
            <div className="text-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
              >
                Sign in instead
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
