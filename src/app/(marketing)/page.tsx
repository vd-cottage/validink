'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { HeroSection } from '@/components/marketing/hero';
import { FeaturesSection } from '@/components/marketing/features';
import { PricingSection } from '@/components/marketing/pricing';
import { StatsSection } from '@/components/marketing/stats';
import { IntegrationsSection } from '@/components/marketing/integrations';
import { CTASection } from '@/components/marketing/cta';

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect logged-in users to dashboard
  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  // Show loading state while checking auth
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render landing page for authenticated users (they'll be redirected)
  if (status === 'authenticated') {
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <StatsSection />
        <PricingSection />
        <IntegrationsSection />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}

