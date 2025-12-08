'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export function CTASection() {
  const router = useRouter();

  return (
    <section className="py-24 bg-primary text-primary-foreground">
      <div className="container text-center">
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to improve your email deliverability?
        </h2>
        <p className="mt-4 text-lg opacity-90 max-w-2xl mx-auto">
          Join thousands of businesses using our email validation service to reduce bounce rates
          and protect their sender reputation.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button
            size="lg"
            variant="secondary"
            onClick={() => router.push('/register')}
          >
            Start Free Trial
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white/10"
            onClick={() => router.push('/docs')}
          >
            View Documentation
          </Button>
        </div>
      </div>
    </section>
  );
}

