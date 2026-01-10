'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { FormInput, OTPInput } from '@/components/ui/form-input';
import Link from 'next/link';
import { Mail, ShieldCheck, Lock, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/marketing/navbar';
import { loginSchema, type LoginFormData } from '@/lib/validations';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [totpCode, setTotpCode] = useState('');
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  // React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors, touchedFields },
    watch,
    setFocus,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const watchedEmail = watch('email');
  const watchedPassword = watch('password');

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  // Auto-focus email on mount
  useEffect(() => {
    if (!showTwoFactor) {
      setFocus('email');
    }
  }, [setFocus, showTwoFactor]);

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

  // Don't render login page for authenticated users
  if (status === 'authenticated') {
    return null;
  }

  async function onSubmit(data: LoginFormData) {
    setIsLoading(true);
    setServerError('');

    // Store credentials for 2FA resubmission
    setCredentials({ email: data.email, password: data.password });

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        totpCode: showTwoFactor ? totpCode : undefined,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === '2FA_REQUIRED') {
          setShowTwoFactor(true);
          setServerError('');
          setIsLoading(false);
          return;
        }
        setServerError(result.error);
        return;
      }

      router.push('/dashboard');
    } catch (error) {
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleTwoFactorSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (totpCode.length !== 6) {
      setServerError('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    setServerError('');

    try {
      const result = await signIn('credentials', {
        email: credentials.email,
        password: credentials.password,
        totpCode,
        redirect: false,
      });

      if (result?.error) {
        setServerError(result.error);
        setTotpCode('');
        return;
      }

      router.push('/dashboard');
    } catch (error) {
      setServerError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

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
                {showTwoFactor ? (
                  <ShieldCheck className="h-8 w-8 text-primary" />
                ) : (
                  <Lock className="h-8 w-8 text-primary" />
                )}
              </div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
                {showTwoFactor ? 'Two-Factor Authentication' : 'Welcome back'}
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                {showTwoFactor
                  ? 'Enter the 6-digit code from your authenticator app'
                  : 'Sign in to your account to continue'}
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

            {!showTwoFactor ? (
              /* Login Form */
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    leftIcon={<Lock className="h-4 w-4" />}
                    error={errors.password?.message}
                    disabled={isLoading}
                    {...register('password')}
                  />
                  <div className="flex justify-end">
                    <Link
                      href="/forgot-password"
                      className="text-sm font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                </div>

                <Button
                  className="w-full h-11 text-base font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            ) : (
              /* 2FA Form */
              <form onSubmit={handleTwoFactorSubmit} className="space-y-6">
                <div className="space-y-4">
                  <OTPInput
                    length={6}
                    value={totpCode}
                    onChange={setTotpCode}
                    disabled={isLoading}
                    autoFocus
                  />
                  <p className="text-center text-xs text-muted-foreground">
                    Open your authenticator app and enter the code
                  </p>
                </div>

                <Button
                  className="w-full h-11 text-base font-medium shadow-lg shadow-primary/25"
                  type="submit"
                  disabled={isLoading || totpCode.length !== 6}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify Code
                      <ShieldCheck className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setShowTwoFactor(false);
                    setTotpCode('');
                    setServerError('');
                  }}
                >
                  <ArrowRight className="mr-2 h-4 w-4 rotate-180" />
                  Back to login
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
                  New to ValidInk?
                </span>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="text-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors group"
              >
                Create an account
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold tracking-tight">
                    Verify with Confidence
                  </h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Join thousands of businesses ensuring their communication reaches real people. Fast, accurate, and secure email validation at your fingertips.
                </p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                  <div className="text-3xl font-bold text-primary">99.6%</div>
                  <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                </div>
                <div className="p-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg rounded-xl border border-gray-200/50 dark:border-gray-700/50">
                  <div className="text-3xl font-bold text-primary">50ms</div>
                  <div className="text-sm text-muted-foreground">Avg Response</div>
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
