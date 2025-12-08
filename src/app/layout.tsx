import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import { ClientProviders } from '@/components/providers/client-providers';
import { createThemeVariables } from '@/lib/theme/utils';
import { OrganizationJsonLd, WebsiteJsonLd, SoftwareApplicationJsonLd } from '@/components/seo/json-ld';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

const themeVariables = createThemeVariables();

export const metadata: Metadata = {
  metadataBase: new URL('https://validink.com'),
  title: {
    default: 'ValidInk - Accurate, Fast & Secure Email Validation',
    template: '%s | ValidInk',
  },
  description: 'Validate emails in real-time with 99.6% accuracy. Reduce bounce rates, protect your sender reputation, and improve email deliverability.',
  keywords: 'email validation, email verifier, reduce bounce rate, email cleaner, email verification api, disposable email detector, validink',
  authors: [{ name: 'ValidInk Team' }],
  creator: 'ValidInk',
  publisher: 'ValidInk',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://validink.com',
    title: 'ValidInk - Accurate, Fast & Secure Email Validation',
    description: 'Ensure your emails reach the inbox. Real-time verification, bulk processing, and API integration.',
    siteName: 'ValidInk',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'ValidInk - Email Validation Service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ValidInk - Email Validation Service',
    description: 'Stop hard bounces. Start ValidInk.',
    creator: '@validink',
    images: ['/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || '',
    other: {
      'msvalidate.01': process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || '',
    },
  },
  alternates: {
    canonical: 'https://validink.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <OrganizationJsonLd />
        <WebsiteJsonLd />
        <SoftwareApplicationJsonLd />
      </head>
      <body
        className={inter.className}
        style={themeVariables as React.CSSProperties}
      >
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
