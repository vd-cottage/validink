import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Help Center & FAQ - ValidInk Email Validation',
  description: 'Get help with ValidInk email validation. Find answers to frequently asked questions about email verification, API usage, credits, and more.',
  keywords: 'email validation help, FAQ, email verification support, API help, troubleshooting',
  openGraph: {
    title: 'Help Center - ValidInk',
    description: 'Find answers to common questions about email validation and get support.',
    url: 'https://validink.com/help',
    images: [
      {
        url: '/og-help.png',
        width: 1200,
        height: 630,
        alt: 'ValidInk Help Center',
      },
    ],
  },
};

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return children;
}
