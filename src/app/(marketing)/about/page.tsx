import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Zap, Users, Globe } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - ValidInk Email Validation Service',
  description: 'Learn about ValidInk, our mission to help businesses maintain clean email lists, and our commitment to security, accuracy, and customer success.',
  keywords: 'about validink, email validation company, email verification service, email marketing tools',
  openGraph: {
    title: 'About ValidInk - Email Validation Service',
    description: 'We help businesses maintain clean, deliverable email lists and improve email marketing success.',
    url: 'https://validink.com/about',
  },
};

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 sm:py-32 bg-gradient-to-b from-primary/5 to-background">
          <div className="container px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                About Validink
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground">
                We&apos;re on a mission to help businesses maintain clean, deliverable email lists
                and improve their email marketing success.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 sm:py-24">
          <div className="container px-4 sm:px-6">
            <h2 className="text-2xl sm:text-3xl font-bold mb-12 text-center">Our Values</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
              <Card>
                <CardHeader>
                  <Shield className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Security First</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Your data is encrypted and never shared. We take privacy seriously.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Zap className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Speed & Accuracy</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Fast validation with 92.9% accuracy using ML-powered detection.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Users className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Customer Focus</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    We build what our customers need, with responsive support.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <Globe className="h-8 w-8 text-primary mb-2" />
                  <CardTitle>Global Scale</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">
                    Built to handle millions of validations with worldwide coverage.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-16 sm:py-24 bg-muted/30">
          <div className="container px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Get in Touch</h2>
            <p className="text-muted-foreground mb-4">
              Have questions? We&apos;d love to hear from you.
            </p>
            <a
              href="mailto:support@validink.io"
              className="text-primary hover:underline"
            >
              support@validink.io
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
