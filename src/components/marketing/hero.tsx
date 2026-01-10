'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/services/api';
import { toast } from 'sonner';
import Script from 'next/script';

// Turnstile types
declare global {
  interface Window {
    turnstile: {
      render: (container: string | HTMLElement, options: TurnstileOptions) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
    onTurnstileLoad: () => void;
  }
}

interface TurnstileOptions {
  sitekey: string;
  callback: (token: string) => void;
  'error-callback'?: () => void;
  'expired-callback'?: () => void;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
}

export function HeroSection() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileWidgetId, setTurnstileWidgetId] = useState<string | null>(null);
  const [turnstileLoaded, setTurnstileLoaded] = useState(false);

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  // Initialize Turnstile when script loads
  const initTurnstile = useCallback(() => {
    if (!siteKey || turnstileWidgetId) return;

    const container = document.getElementById('turnstile-container');
    if (!container || !window.turnstile) return;

    try {
      const widgetId = window.turnstile.render(container, {
        sitekey: siteKey,
        callback: (token: string) => {
          setTurnstileToken(token);
        },
        'error-callback': () => {
          toast.error('CAPTCHA error. Please refresh and try again.');
          setTurnstileToken(null);
        },
        'expired-callback': () => {
          setTurnstileToken(null);
        },
        theme: 'auto',
        size: 'normal'
      });
      setTurnstileWidgetId(widgetId);
    } catch (error) {
      console.error('Turnstile initialization error:', error);
    }
  }, [siteKey, turnstileWidgetId]);

  // Set up global callback for Turnstile script load
  useEffect(() => {
    window.onTurnstileLoad = () => {
      setTurnstileLoaded(true);
    };

    // If script already loaded, init immediately
    if (window.turnstile) {
      setTurnstileLoaded(true);
    }

    return () => {
      // Cleanup widget on unmount
      if (turnstileWidgetId && window.turnstile) {
        try {
          window.turnstile.remove(turnstileWidgetId);
        } catch (e) {
          // Ignore cleanup errors
        }
      }
    };
  }, [turnstileWidgetId]);

  // Initialize Turnstile when loaded
  useEffect(() => {
    if (turnstileLoaded) {
      initTurnstile();
    }
  }, [turnstileLoaded, initTurnstile]);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter an email address');
      return;
    }

    // Check for Turnstile token (skip if no site key configured - dev mode)
    if (siteKey && !turnstileToken) {
      toast.error('Please complete the verification');
      return;
    }

    setIsValidating(true);
    try {
      const response = await apiService.public.tryEmail(email, turnstileToken || '');
      setResult(response.data.data);

      // Reset Turnstile for next use
      if (turnstileWidgetId && window.turnstile) {
        window.turnstile.reset(turnstileWidgetId);
        setTurnstileToken(null);
      }
    } catch (error: any) {
      console.error('Validation error:', error);

      if (error.response?.data?.is_limit_exceeded) {
        toast.error('Daily limit reached. Sign up for more validations!');
      } else if (error.response?.data?.code === 'CAPTCHA_REQUIRED') {
        toast.error('Please complete the verification');
      } else if (error.response?.data?.code === 'CAPTCHA_FAILED') {
        toast.error('Verification failed. Please try again.');
        // Reset Turnstile on failure
        if (turnstileWidgetId && window.turnstile) {
          window.turnstile.reset(turnstileWidgetId);
          setTurnstileToken(null);
        }
      } else {
        toast.error(error.response?.data?.error || 'Validation failed. Please try again.');
      }
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <section className="relative">
      {/* Turnstile Script */}
      {siteKey && (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad"
          async
          defer
        />
      )}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-24 md:py-32">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl md:text-5xl lg:text-6xl">
            Accurate, fast and secure{' '}
            <span className="text-primary block sm:inline">email validation</span>
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-7 sm:leading-8 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-2">
            Validate emails in real-time with 99.6% accuracy. Reduce bounce rates,
            protect your sender reputation, and improve email deliverability.
          </p>
          <div className="mt-8 sm:mt-10">
            <form onSubmit={handleValidate} className="max-w-xl mx-auto px-2">
              {/* Stack on mobile, row on larger screens */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-x-4">
                <Input
                  type="email"
                  placeholder="Enter an email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="submit"
                  disabled={isValidating || (siteKey ? !turnstileToken : false)}
                  className="w-full sm:w-auto"
                >
                  {isValidating ? 'Validating...' : 'Validate'}
                </Button>
              </div>

              {/* Turnstile Widget Container */}
              {siteKey && (
                <div className="mt-4 flex justify-center">
                  <div id="turnstile-container"></div>
                </div>
              )}
            </form>

            {result && (
              <div className="mt-4 p-4 bg-background rounded-lg border animate-in mx-2 sm:mx-auto max-w-xl">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-left">
                    <p className="font-medium">Valid Syntax:</p>
                    <p className={result.syntax_valid ? 'text-success' : 'text-destructive'}>
                      {result.syntax_valid ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Domain:</p>
                    <p className={result.domain_exists ? 'text-success' : 'text-destructive'}>
                      {result.domain_exists ? 'Valid' : 'Invalid'}
                    </p>
                  </div>
                </div>
                {result.message && (
                  <p className="text-muted-foreground text-sm mt-2">
                    {result.message}
                  </p>
                )}
                <Button
                  variant="link"
                  className="mt-2"
                  onClick={() => router.push('/register')}
                >
                  Sign up for more detailed results →
                </Button>
              </div>
            )}
          </div>
          {/* Stack buttons on mobile */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6 px-4">
            <Button size="lg" onClick={() => router.push('/register')} className="w-full sm:w-auto">
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push('/docs')} className="w-full sm:w-auto">
              View Documentation
            </Button>
          </div>
        </div>
      </div>
      <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
        <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-primary to-primary-light opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" />
      </div>
    </section>
  );
}
