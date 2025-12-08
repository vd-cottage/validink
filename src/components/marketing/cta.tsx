'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function CTASection() {
  const router = useRouter();

  return (
    <section className="py-12 sm:py-24 bg-primary text-primary-foreground">
      <div className="container text-center px-4 sm:px-6">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl">
          Ready to improve your email deliverability?
        </h2>
        <p className="mt-3 sm:mt-4 text-base sm:text-lg opacity-90 max-w-2xl mx-auto">
          Join thousands of businesses using our email validation service to reduce bounce rates
          and protect their sender reputation.
        </p>
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-x-6">
          <Button
            size="lg"
            variant="secondary"
            onClick={() => router.push('/register')}
            className="w-full sm:w-auto"
          >
            Start Free Trial
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white/10 w-full sm:w-auto"
            onClick={() => router.push('/docs')}
          >
            View Documentation
          </Button>
        </div>
      </div>
    </section>
  );
}

