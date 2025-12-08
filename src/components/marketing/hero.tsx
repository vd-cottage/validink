'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/services/api';

export function HeroSection() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    try {
      const response = await apiService.validation.comprehensive(email);
      setResult(response.data);
    } catch (error) {
      console.error('Validation error:', error);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <section className="relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 md:py-32">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            Accurate, fast and secure{' '}
            <span className="text-primary">email validation</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Validate emails in real-time with 99.6% accuracy. Reduce bounce rates,
            protect your sender reputation, and improve email deliverability.
          </p>
          <div className="mt-10">
            <form onSubmit={handleValidate} className="max-w-xl mx-auto">
              <div className="flex gap-x-4">
                <Input
                  type="email"
                  placeholder="Try it now: enter an email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" disabled={isValidating}>
                  {isValidating ? 'Validating...' : 'Validate'}
                </Button>
              </div>
            </form>
            {result && (
              <div className="mt-4 p-4 bg-background rounded-lg border animate-in">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-left">
                    <p className="font-medium">Valid Syntax:</p>
                    <p className={result.is_valid ? 'text-success' : 'text-destructive'}>
                      {result.is_valid ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Domain:</p>
                    <p className={result.domain_exists ? 'text-success' : 'text-destructive'}>
                      {result.domain_exists ? 'Valid' : 'Invalid'}
                    </p>
                  </div>
                </div>
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
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Button size="lg" onClick={() => router.push('/register')}>
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" onClick={() => router.push('/docs')}>
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

