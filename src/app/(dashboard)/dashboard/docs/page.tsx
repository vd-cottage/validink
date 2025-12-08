'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Code, Zap, Shield } from 'lucide-react';

export default function DashboardDocsPage() {
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
        { label: 'Dashboard API', href: '#dashboard-api' },
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Documentation</h1>
        <p className="text-muted-foreground mt-1">
          Everything you need to integrate email validation into your application
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {sections.map((section) => (
          <Card key={section.title}>
            <CardHeader className="pb-2">
              <section.icon className="h-6 w-6 sm:h-8 sm:w-8 mb-2 text-primary" />
              <CardTitle className="text-base sm:text-lg">{section.title}</CardTitle>
              <CardDescription className="text-xs sm:text-sm">{section.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-xs sm:text-sm text-muted-foreground hover:text-primary"
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
      <div className="space-y-8 sm:space-y-12">
        {/* Quick Start */}
        <section id="installation" className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">Quick Start</h2>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">1. Get Your API Key</h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              Get your API key from the <Link href="/dashboard/settings" className="text-primary hover:underline">Settings page</Link>.
            </p>
            <div className="bg-muted p-3 sm:p-4 rounded-lg overflow-x-auto">
              <code className="text-xs sm:text-sm">API Key: evp_xxxxxxxxxxxxxxxxxxxxxx</code>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" id="authentication">2. Authentication</h3>
            <p className="text-muted-foreground text-sm sm:text-base">
              Include your API key in the Authorization header:
            </p>
            <pre className="bg-muted p-3 sm:p-4 rounded-lg overflow-x-auto">
              <code className="text-xs sm:text-sm">{`Authorization: Bearer YOUR_API_KEY`}</code>
            </pre>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold" id="first-validation">3. Validate Your First Email</h3>
            <pre className="bg-muted p-3 sm:p-4 rounded-lg overflow-x-auto">
              <code className="text-xs sm:text-sm whitespace-pre">{`curl -X POST https://api.validink.io/api/v1/validate/comprehensive \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"email": "test@example.com"}'`}</code>
            </pre>
          </div>
        </section>

        {/* API Reference */}
        <section id="validation" className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">API Reference</h2>

          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Comprehensive Validation</CardTitle>
                <CardDescription>POST /api/v1/validate/comprehensive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium text-sm mb-2">Request:</p>
                  <pre className="bg-muted p-3 rounded text-xs sm:text-sm overflow-x-auto">
{`{
  "email": "user@example.com"
}`}
                  </pre>
                </div>
                <div>
                  <p className="font-medium text-sm mb-2">Response:</p>
                  <pre className="bg-muted p-3 rounded text-xs sm:text-sm overflow-x-auto">
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
              </CardContent>
            </Card>

            <Card id="bulk">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Batch Validation</CardTitle>
                <CardDescription>POST /api/v1/validate/batch</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="font-medium text-sm mb-2">Request:</p>
                <pre className="bg-muted p-3 rounded text-xs sm:text-sm overflow-x-auto">
{`{
  "emails": [
    "user1@example.com",
    "user2@example.com"
  ]
}`}
                </pre>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Integration Examples */}
        <section id="nodejs" className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">Integration Examples</h2>

          <div className="space-y-4 sm:space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Node.js</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-3 sm:p-4 rounded-lg overflow-x-auto">
                  <code className="text-xs sm:text-sm whitespace-pre">{`const axios = require('axios');

const apiKey = 'YOUR_API_KEY';
const email = 'test@example.com';

async function validateEmail(email) {
  try {
    const response = await axios.post(
      'https://api.validink.io/api/v1/validate/comprehensive',
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
              </CardContent>
            </Card>

            <Card id="python">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Python</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-3 sm:p-4 rounded-lg overflow-x-auto">
                  <code className="text-xs sm:text-sm whitespace-pre">{`import requests

api_key = 'YOUR_API_KEY'
email = 'test@example.com'

def validate_email(email):
    url = 'https://api.validink.io/api/v1/validate/comprehensive'
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
              </CardContent>
            </Card>

            <Card id="php">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">PHP</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-3 sm:p-4 rounded-lg overflow-x-auto">
                  <code className="text-xs sm:text-sm whitespace-pre">{`<?php

$apiKey = 'YOUR_API_KEY';
$email = 'test@example.com';

$ch = curl_init('https://api.validink.io/api/v1/validate/comprehensive');
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
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Security */}
        <section id="api-keys" className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold">Security Best Practices</h2>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">API Key Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>• Never expose API keys in client-side code</p>
                <p>• Rotate keys regularly</p>
                <p>• Use environment variables to store keys</p>
                <p>• Implement IP whitelisting when possible</p>
              </CardContent>
            </Card>

            <Card id="rate-limiting">
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">Rate Limiting</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-2 text-sm">Default limits by plan:</p>
                <ul className="space-y-1 text-sm">
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
  );
}
