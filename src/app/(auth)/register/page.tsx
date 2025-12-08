'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Mail, User, Lock, ArrowRight, Loader2, Sparkles, KeyRound, Eye, EyeOff } from 'lucide-react';
import axios from 'axios';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'initiate' | 'verify'>('initiate');
  const [resendCooldown, setResendCooldown] = useState(0);

  // Timer effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  async function handleResend() {
    if (resendCooldown > 0) return;

    setIsLoading(true);
    setError('');

    const { name, email: emailVal, password } = formData;

    try {
      // Re-initiate registration to send a new OTP
      const response = await axios.post('/api/v1/auth/register/initiate', {
        email: emailVal,
        password: password,
        name: name
      });

      setResendCooldown(30); // 30s cooldown

      // Auto-fill logic for testing
      if (response.data.data?.otp) {
        console.log('TESTING OTP (RESEND):', response.data.data.otp);
        setTimeout(() => {
          const otpInput = document.getElementById('otp') as HTMLInputElement;
          if (otpInput) {
            otpInput.value = response.data.data.otp;
          }
        }, 500);
      }

    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to resend code.');
    } finally {
      setIsLoading(false);
    }
  }
  const [email, setEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Use state for form data to easily access it in onClick
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  async function handleInitiateClick() {
    setIsLoading(true);
    setError('');

    const { name, email: emailVal, password } = formData;

    if (!name || !emailVal || !password) {
      setError('All fields are required');
      setIsLoading(false);
      return;
    }

    setEmail(emailVal);

    console.log('Initiating registration (onClick) for:', emailVal);

    try {
      console.log('Sending request to /api/v1/auth/register/initiate');
      // Fix: Send all required fields
      const response = await axios.post('/api/v1/auth/register/initiate', {
        email: emailVal,
        password: password,
        name: name
      });
      console.log('Response received:', response.status, response.data);

      setStep('verify');

      // FOR TESTING: Auto-fill OTP if present in response
      if (response.data.data?.otp) {
        console.log('TESTING OTP:', response.data.data.otp);
        setTimeout(() => {
          const otpInput = document.getElementById('otp') as HTMLInputElement;
          if (otpInput) {
            otpInput.value = response.data.data.otp;
          }
        }, 500);
      }
    } catch (error: any) {
      console.error('Registration Error:', error);
      setError(error.response?.data?.error || 'Failed to send verification code.');
    } finally {
      setIsLoading(false);
    }
  }

  async function onVerify(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError('');

    const verifyData = new FormData(event.currentTarget);
    const otp = verifyData.get('otp') as string;

    try {
      await axios.post('/api/v1/auth/register/verify', {
        email,
        otp
      });

      const result = await signIn('credentials', {
        email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
        return;
      }

      router.push('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Invalid code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      {/* Visual Side */}
      <div className="hidden bg-muted lg:block relative overflow-hidden order-2 lg:order-1">
        <div className="absolute inset-0 bg-primary/10 dark:bg-primary/5" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full max-w-lg p-8 relative z-10">
            <div className="mb-8 p-6 bg-background/50 backdrop-blur-sm rounded-2xl border border-white/20 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Sparkles className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Start for Free</h2>
              </div>
              <ul className="space-y-4">
                {['100 Fast Validations / Month', 'Real-time Deep Verification', 'Bulk CSV Processing', 'Hunter-style Email Finder'].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-muted-foreground">
                    <span className="h-6 w-6 rounded-full bg-success/10 text-success flex items-center justify-center text-xs">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-primary/20 to-purple-500/20 rounded-full blur-[100px] opacity-50" />
          </div>
        </div>
      </div>

      {/* Form Side */}
      <div className="flex items-center justify-center py-12 order-1 lg:order-2">
        <div className="mx-auto w-[350px] space-y-6">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-3xl font-bold tracking-tighter">
              {step === 'initiate' ? 'Create an account' : 'Verify Email'}
            </h1>
            <p className="text-muted-foreground">
              {step === 'initiate' ? 'Enter your details to get started' : `Enter the verification code sent to ${email}`}
            </p>
          </div>

          {step === 'initiate' ? (
            <div className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9" id="name" name="name" placeholder="John Doe"
                    value={formData.name} onChange={handleInputChange}
                    required disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9" id="email" name="email" placeholder="name@example.com" type="email"
                    value={formData.email} onChange={handleInputChange}
                    required disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9 pr-10" id="password" name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password} onChange={handleInputChange}
                    required disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={handleInitiateClick}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending Code...
                  </>
                ) : (
                  <>
                    Continue <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          ) : (
            <form onSubmit={onVerify} className="space-y-4">
              {error && (
                <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email-verify">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-9 bg-muted" id="email-verify"
                    value={email}
                    disabled
                    readOnly
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="otp">Verification Code</Label>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-9" id="otp" name="otp" placeholder="123456" required disabled={isLoading} />
                </div>
              </div>

              <Button className="w-full" type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    Complete Registration <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="w-full"
                  type="button"
                  onClick={handleResend}
                  disabled={isLoading || resendCooldown > 0}
                >
                  {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  type="button"
                  onClick={() => setStep('initiate')}
                  disabled={isLoading}
                >
                  Back
                </Button>
              </div>
            </form>
          )}

          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
