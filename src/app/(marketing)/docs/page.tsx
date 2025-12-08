import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Code, Zap, Shield, Globe, Settings } from 'lucide-react';

export default function DocsPage() {
  const sections = [
    {
      icon: Zap,
      title: 'Quick Start',
      description: 'Get started with email validation in minutes',
      links: [
        { label: 'Installation', href: '#installation' },
        { label: 'Authentication', href: '#authentication' },
        { label: 'First Validation', href: '#first-validation' },
      ]
    },
    {
      icon: Code,
      title: 'API Reference',
      description: 'Complete API endpoint documentation',
      links: [
        { label: 'Validation Endpoints', href: '#validation' },
        { label: 'Bulk Processing', href: '#bulk' },
        { label: 'Dashboard API', href: '#dashboard' },
      ]
    },
    {
      icon: BookOpen,
      title: 'Integration Guides',
      description: 'Code examples in multiple languages',
      links: [
        { label: 'Node.js', href: '#nodejs' },
        { label: 'Python', href: '#python' },
        { label: 'PHP', href: '#php' },
      ]
    },
    {
      icon: Shield,
      title: 'Security',
      description: 'Best practices and security guidelines',
      links: [
        { label: 'API Keys', href: '#api-keys' },
        { label: 'Rate Limiting', href: '#rate-limiting' },
        { label: 'IP Whitelisting', href: '#ip-whitelist' },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">EmailPro</span>
          </Link>
          <nav className="flex items-center space-x-6">
            <Link href="/docs" className="text-sm font-medium">
              Docs
            </Link>
            <Link href="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      <div className="container py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Documentation</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to integrate email validation into your application
          </p>
        </div>

        {/* Quick Links */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-12">
          {sections.map((section) => (
            <Card key={section.title}>
              <CardHeader>
                <section.icon className="h-8 w-8 mb-2 text-primary" />
                <CardTitle>{section.title}</CardTitle>
                <CardDescription>{section.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link 
                        href={link.href}
                        className="text-sm text-muted-foreground hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Quick Start */}
          <section id="installation" className="space-y-4">
            <h2 className="text-3xl font-bold">Quick Start</h2>
            
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">1. Get Your API Key</h3>
              <p className="text-muted-foreground">
                Sign up and get your API key from the dashboard settings.
              </p>
              <div className="bg-muted p-4 rounded-lg">
                <code className="text-sm">API Key: evp_xxxxxxxxxxxxxxxxxxxxxx</code>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold" id="authentication">2. Authentication</h3>
              <p className="text-muted-foreground">
                Include your API key in the Authorization header:
              </p>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                <code className="text-sm">{`Authorization: Bearer YOUR_API_KEY`}</code>
              </pre>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold" id="first-validation">3. Validate Your First Email</h3>
              <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                <code className="text-sm">{`curl -X POST https://api.emailpro.com/api/v1/validate/comprehensive \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "test@example.com"}'`}</code>
              </pre>
            </div>
          </section>

          {/* API Reference */}
          <section id="validation" className="space-y-4">
            <h2 className="text-3xl font-bold">API Reference</h2>
            
            <div className="space-y-6">
              <div className="border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2">Comprehensive Validation</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  POST /api/v1/validate/comprehensive
                </p>
                <div className="space-y-2">
                  <p className="font-medium">Request:</p>
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`{
  "email": "user@example.com"
}`}
                  </pre>
                  <p className="font-medium mt-4">Response:</p>
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`{
  "success": true,
  "data": {
    "email": "user@example.com",
    "is_valid": true,
    "is_disposable": false,
    "fraud_score": 0.1,
    "risk_level": "low",
    "domain_reputation": 0.95
  }
}`}
                  </pre>
                </div>
              </div>

              <div className="border rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2">Batch Validation</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  POST /api/v1/validate/batch
                </p>
                <div className="space-y-2">
                  <p className="font-medium">Request:</p>
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`{
  "emails": [
    "user1@example.com",
    "user2@example.com"
  ]
}`}
                  </pre>
                </div>
              </div>
            </div>
          </section>

          {/* Integration Examples */}
          <section id="nodejs" className="space-y-4">
            <h2 className="text-3xl font-bold">Integration Examples</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-4">Node.js</h3>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">{`const axios = require('axios');

const apiKey = 'YOUR_API_KEY';
const email = 'test@example.com';

async function validateEmail(email) {
  try {
    const response = await axios.post(
      'https://api.emailpro.com/api/v1/validate/comprehensive',
      { email },
      {
        headers: {
          'Authorization': \`Bearer \${apiKey}\`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log(response.data);
  } catch (error) {
    console.error('Validation failed:', error);
  }
}

validateEmail(email);`}</code>
                </pre>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4" id="python">Python</h3>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">{`import requests

api_key = 'YOUR_API_KEY'
email = 'test@example.com'

def validate_email(email):
    url = 'https://api.emailpro.com/api/v1/validate/comprehensive'
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json'
    }
    data = {'email': email}
    
    response = requests.post(url, json=data, headers=headers)
    return response.json()

result = validate_email(email)
print(result)`}</code>
                </pre>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4" id="php">PHP</h3>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto">
                  <code className="text-sm">{`<?php

$apiKey = 'YOUR_API_KEY';
$email = 'test@example.com';

$ch = curl_init('https://api.emailpro.com/api/v1/validate/comprehensive');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $apiKey,
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'email' => $email
]));

$response = curl_exec($ch);
curl_close($ch);

$result = json_decode($response, true);
print_r($result);`}</code>
                </pre>
              </div>
            </div>
          </section>

          {/* Security */}
          <section id="api-keys" className="space-y-4">
            <h2 className="text-3xl font-bold">Security Best Practices</h2>
            
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>API Key Security</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p>• Never expose API keys in client-side code</p>
                  <p>• Rotate keys regularly</p>
                  <p>• Use environment variables to store keys</p>
                  <p>• Implement IP whitelisting when possible</p>
                </CardContent>
              </Card>

              <Card id="rate-limiting">
                <CardHeader>
                  <CardTitle>Rate Limiting</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-2">Default limits by plan:</p>
                  <ul className="space-y-1">
                    <li>• Free: 100 requests/minute</li>
                    <li>• Pro: 500 requests/minute</li>
                    <li>• Enterprise: Custom limits</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container py-8">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 EmailPro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

