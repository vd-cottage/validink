import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  CheckCircle, 
  Shield, 
  Zap, 
  BarChart, 
  Mail, 
  AlertTriangle,
  Database,
  RefreshCw
} from 'lucide-react';

const features = [
  {
    title: 'Email Validation',
    description: 'Validate email syntax, domain, and mailbox in real-time with 99.6% accuracy.',
    icon: CheckCircle,
  },
  {
    title: 'Fraud Detection',
    description: 'Advanced ML-powered fraud detection to identify risky email patterns.',
    icon: Shield,
  },
  {
    title: 'Real-time API',
    description: 'Fast and reliable API with comprehensive documentation and examples.',
    icon: Zap,
  },
  {
    title: 'Analytics Dashboard',
    description: 'Detailed analytics and insights about your email validation usage.',
    icon: BarChart,
  },
  {
    title: 'SMTP Verification',
    description: 'Deep SMTP validation to verify mailbox existence without sending emails.',
    icon: Mail,
  },
  {
    title: 'Disposable Detection',
    description: 'Identify and flag temporary and disposable email addresses.',
    icon: AlertTriangle,
  },
  {
    title: 'Bulk Processing',
    description: 'Validate large lists of emails efficiently with batch processing.',
    icon: Database,
  },
  {
    title: 'Auto-correction',
    description: 'Smart typo detection and domain correction suggestions.',
    icon: RefreshCw,
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-12 sm:py-24 bg-muted/50">
      <div className="container px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need for email validation
          </h2>
          <p className="mt-3 sm:mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive email validation tools to improve deliverability and protect your sender reputation.
          </p>
        </div>
        <div className="mt-10 sm:mt-16 grid gap-4 sm:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="bg-background">
              <CardHeader>
                <feature.icon className="h-8 w-8 text-primary" />
                <CardTitle className="mt-4">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

