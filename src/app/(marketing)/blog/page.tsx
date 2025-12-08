'use client';

import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Newspaper, Bell, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function BlogPage() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 sm:py-32 bg-gradient-to-b from-primary/5 to-background">
          <div className="container px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                <Newspaper className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
                Blog Coming Soon
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                We&apos;re working on amazing content about email validation, deliverability best practices,
                and industry insights. Subscribe to be the first to know when we launch!
              </p>

              {/* Subscribe Form */}
              <Card className="max-w-md mx-auto">
                <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2">
                    <Bell className="h-5 w-5" />
                    Get Notified
                  </CardTitle>
                  <CardDescription>
                    Be the first to read our latest articles
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {subscribed ? (
                    <div className="text-center py-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success/10 mb-3">
                        <svg className="h-6 w-6 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="text-success font-medium">You&apos;re subscribed!</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        We&apos;ll notify you when we publish new content.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
                      <Input
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="flex-1"
                      />
                      <Button type="submit">
                        Subscribe
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Upcoming Topics */}
        <section className="py-16 sm:py-24">
          <div className="container px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold mb-4">What We&apos;ll Cover</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Stay tuned for expert insights on these topics
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {[
                {
                  title: 'Email Deliverability',
                  description: 'Learn how to improve your email delivery rates and avoid spam filters.',
                },
                {
                  title: 'API Best Practices',
                  description: 'Tips and tricks for integrating email validation into your applications.',
                },
                {
                  title: 'Industry Updates',
                  description: 'Stay informed about the latest trends in email marketing and validation.',
                },
                {
                  title: 'Case Studies',
                  description: 'Real-world examples of how businesses improved their email quality.',
                },
                {
                  title: 'Technical Deep Dives',
                  description: 'Explore the technology behind accurate email validation.',
                },
                {
                  title: 'Product Updates',
                  description: 'Be the first to know about new features and improvements.',
                },
              ].map((topic, index) => (
                <Card key={index} className="bg-muted/30">
                  <CardHeader>
                    <CardTitle className="text-lg">{topic.title}</CardTitle>
                    <CardDescription>{topic.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
