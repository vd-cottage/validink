import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - ValidInk',
  description: 'ValidInk privacy policy. Learn how we collect, use, and protect your data. GDPR compliant email validation service.',
  keywords: 'privacy policy, data protection, GDPR compliance, email validation privacy',
  openGraph: {
    title: 'Privacy Policy - ValidInk',
    description: 'Learn how ValidInk protects your data and privacy.',
    url: 'https://validink.com/privacy',
  },
};

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        <div className="container py-12 sm:py-20 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-bold mb-8">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground mb-8">Last updated: December 2025</p>

            <div className="prose prose-sm sm:prose max-w-none space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
                <p className="text-muted-foreground">
                  We collect information you provide directly, including email addresses for validation,
                  account registration details, and payment information. We also collect usage data
                  to improve our services.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">2. How We Use Your Information</h2>
                <p className="text-muted-foreground">
                  We use your information to provide email validation services, process payments,
                  send service updates, and improve our platform. We never sell your data to third parties.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">3. Data Security</h2>
                <p className="text-muted-foreground">
                  All data is encrypted at rest and in transit. Validated emails are hashed and stored
                  for 90 days for your history and analytics. We implement industry-standard security measures.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">4. Data Retention</h2>
                <p className="text-muted-foreground">
                  Validation results are retained for 90 days. You can request deletion of your data
                  at any time from your account settings or by contacting support.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">5. GDPR Compliance</h2>
                <p className="text-muted-foreground">
                  We are fully GDPR compliant. You have the right to access, correct, or delete your
                  personal data. Contact us at privacy@validink.io for any data-related requests.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">6. Contact Us</h2>
                <p className="text-muted-foreground">
                  For privacy-related questions, contact us at{' '}
                  <a href="mailto:privacy@validink.io" className="text-primary hover:underline">
                    privacy@validink.io
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
