'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, HelpCircle, Mail, MessageSquare } from 'lucide-react';
import { Navbar } from '@/components/marketing/navbar';
import { Footer } from '@/components/marketing/footer';

export default function HelpPage() {
  const faqs = [
    {
      question: 'How accurate is the email validation?',
      answer: 'Our validation achieves 92.9% accuracy using multiple validation layers including syntax checking, domain verification, MX record validation, and ML-powered fraud detection.'
    },
    {
      question: 'What happens to my credits?',
      answer: 'Credits are consumed when you validate an email. Free plan includes 1000 credits. Each validation uses 1 credit. Unused credits roll over monthly for paid plans.'
    },
    {
      question: 'Can I validate emails in bulk?',
      answer: 'Yes! Upload a CSV file with up to 10,000 emails per batch. Bulk validation is processed asynchronously and you\'ll be notified when complete.'
    },
    {
      question: 'What is the difference between validation types?',
      answer: 'Syntax checks email format only (~0.3ms). Comprehensive validation includes syntax, domain, MX records, fraud detection, and reputation scoring (~100ms).'
    },
    {
      question: 'How do I get more credits?',
      answer: 'Purchase credit packages from the Credits page in your dashboard. Packages start at 5,000 credits for $10. Enterprise plans get custom pricing.'
    },
    {
      question: 'Is there an API rate limit?',
      answer: 'Yes. Free: 100 req/min, Pro: 500 req/min, Enterprise: Custom. Rate limits reset every minute.'
    },
    {
      question: 'Can I get a refund?',
      answer: 'We offer a 30-day money-back guarantee on all paid plans. Unused credits can be refunded within 30 days of purchase.'
    },
    {
      question: 'Do you store the emails I validate?',
      answer: 'We store validation results for 90 days for your history and analytics. Emails are hashed and never shared with third parties.'
    },
    {
      question: 'What is disposable email detection?',
      answer: 'We check against 50,000+ known temporary/disposable email providers like tempmail.com, guerrillamail.com, etc.'
    },
    {
      question: 'How does fraud detection work?',
      answer: 'Our ML model analyzes patterns, entropy, character distribution, and domain reputation to assign a fraud score (0-1) and risk level.'
    },
    {
      question: 'Can I integrate this with my app?',
      answer: 'Yes! We provide REST API endpoints, SDKs for Node.js, Python, PHP, and webhooks for async processing.'
    },
    {
      question: 'What about GDPR compliance?',
      answer: 'We are GDPR compliant. Data is encrypted at rest and in transit. You can request data deletion anytime from settings.'
    },
  ];

  const categories = [
    {
      icon: HelpCircle,
      title: 'Getting Started',
      description: 'New to Validink? Start here',
      link: '/docs'
    },
    {
      icon: Search,
      title: 'API Documentation',
      description: 'Complete API reference',
      link: '/docs#api-reference'
    },
    {
      icon: Mail,
      title: 'Validation Types',
      description: 'Learn about different validations',
      link: '/docs#validation'
    },
    {
      icon: MessageSquare,
      title: 'Contact Support',
      description: 'Get help from our team',
      link: 'mailto:support@validink.io'
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <div className="container py-12 px-4 sm:px-6">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">How can we help?</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Find answers to common questions or contact our support team
          </p>
          
          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <input
                type="text"
                placeholder="Search for help..."
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {categories.map((category) => (
            <Link key={category.title} href={category.link}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <category.icon className="h-8 w-8 mb-2 text-primary" />
                  <CardTitle>{category.title}</CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        {/* FAQs */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <div className="max-w-2xl mx-auto mt-16 text-center">
          <Card>
            <CardHeader>
              <CardTitle>Still need help?</CardTitle>
              <CardDescription>
                Our support team is here to help you succeed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild>
                  <a href="mailto:support@validink.io">
                    <Mail className="mr-2 h-4 w-4" />
                    Email Support
                  </a>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/docs">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    View Documentation
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Average response time: 2 hours • support@validink.io
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      </main>

      <Footer />
    </div>
  );
}

