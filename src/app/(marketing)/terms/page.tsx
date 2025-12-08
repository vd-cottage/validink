import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - ValidInk',
  description: 'ValidInk terms of service. Read our terms and conditions for using our email validation API and services.',
  keywords: 'terms of service, terms and conditions, email validation terms, API usage terms',
  openGraph: {
    title: 'Terms of Service - ValidInk',
    description: 'Terms and conditions for using ValidInk email validation services.',
    url: 'https://validink.com/terms',
  },
};

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="container py-12 sm:py-20 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold mb-8">Terms of Service</h1>
            <p className="text-sm text-muted-foreground mb-8">Last updated: December 2025</p>

            <div className="prose prose-sm sm:prose max-w-none space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing or using Validink, you agree to be bound by these Terms of Service.
                  If you do not agree, please do not use our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">2. Description of Service</h2>
                <p className="text-muted-foreground">
                  Validink provides email validation services including syntax checking, domain verification,
                  MX record validation, disposable email detection, and fraud scoring.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">3. Account Registration</h2>
                <p className="text-muted-foreground">
                  You must provide accurate information when creating an account. You are responsible
                  for maintaining the security of your account credentials and API keys.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">4. Acceptable Use</h2>
                <p className="text-muted-foreground">
                  You agree not to use our services for spamming, harassment, or any illegal activities.
                  You must comply with all applicable laws regarding email communications.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">5. Payment and Credits</h2>
                <p className="text-muted-foreground">
                  Credits are consumed when validating emails. Unused credits roll over monthly for paid plans.
                  We offer a 30-day money-back guarantee on all paid plans.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">6. Rate Limits</h2>
                <p className="text-muted-foreground">
                  API usage is subject to rate limits based on your plan: Free (100 req/min),
                  Pro (500 req/min), Enterprise (custom). Exceeding limits may result in temporary restrictions.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">7. Disclaimer of Warranties</h2>
                <p className="text-muted-foreground">
                  Our services are provided &quot;as is&quot; without warranties of any kind. While we strive for
                  accuracy, we cannot guarantee 100% accuracy in email validation results.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">8. Contact</h2>
                <p className="text-muted-foreground">
                  For questions about these terms, contact us at{' '}
                  <a href="mailto:legal@validink.io" className="text-primary hover:underline">
                    legal@validink.io
                  </a>
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
