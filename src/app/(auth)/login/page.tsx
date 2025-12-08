'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Mail, ShieldCheck, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [totpCode, setTotpCode] = useState('');
  const [showTwoFactor, setShowTwoFactor] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    const formData = new FormData(event.currentTarget);
    const emailData = formData.get('email') as string;
    const passwordData = formData.get('password') as string;

    // Use state if 2FA mode, otherwise form data
    const email = showTwoFactor ? (document.getElementById('email') as HTMLInputElement)?.value : emailData;
    const password = showTwoFactor ? (document.getElementById('password') as HTMLInputElement)?.value : passwordData;

    try {
      const result = await signIn('credentials', {
        email,
        password,
        totpCode: showTwoFactor ? totpCode : undefined,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === '2FA_REQUIRED') {
          setShowTwoFactor(true);
          setError('');
          setIsLoading(false);
          return;
        }
        setError(result.error);
        return;
      }

      router.push('/dashboard');
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto w-[350px] space-y-6">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tighter">
              {showTwoFactor ? 'Two-Factor Authentication' : 'Welcome back'}
            </h1>
            <p className="text-muted-foreground">
              {showTwoFactor
                ? 'Enter the code from your authenticator app'
                : 'Enter your credentials to access your dashboard'}
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive flex items-center gap-2">
                <ShieldCheck className="h-4 w-4" />
                {error}
              </div>
            )}

            {!showTwoFactor ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input className="pl-9" id="email" name="email" placeholder="name@example.com" type="email" required disabled={isLoading} />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      className="pl-9 pr-9"
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="totpCode">Authentication Code</Label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9 tracking-widest text-center text-lg"
                    id="totpCode"
                    name="totpCode"
                    placeholder="000000"
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value)}
                    required
                    autoFocus
                    disabled={isLoading}
                  />
                  {/* Hidden inputs to preserve credentials for resubmission */}
                  <input type="hidden" id="email" value={(document.getElementsByName('email')[0] as HTMLInputElement)?.value} />
                  <input type="hidden" id="password" value={(document.getElementsByName('password')[0] as HTMLInputElement)?.value} />
                </div>
              </div>
            )}

            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> {showTwoFactor ? 'Verifying...' : 'Signing in...'}
                </>
              ) : (
                <>
                  {showTwoFactor ? 'Verify Code' : 'Sign In'} <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>

            {showTwoFactor && (
              <Button type="button" variant="ghost" className="w-full mt-2" onClick={() => setShowTwoFactor(false)}>
                Back to Login
              </Button>
            )}
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>

      {/* Visual Side */}
      <div className="hidden bg-muted lg:block relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10 dark:bg-primary/5" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full max-w-lg p-8 relative z-10">
            <div className="mb-8 p-4 bg-background/50 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
              <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent mb-4">
                Verify with Confidence.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Join thousands of businesses ensuring their communication reaches real people. Fast, accurate, and secure email validation at your fingertips.
              </p>
            </div>

            {/* Abstract decorative elements */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl opacity-50" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
}
